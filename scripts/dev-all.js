'use strict';

/**
 * Starts the whole local stack in one terminal:
 *   strapi  Strapi (this folder)           PORT from .env (1338)
 *   cms     Zuse CMS (./zuse-cms)          http://localhost:3100
 *   site    the website (./zuse-site)      http://localhost:7100
 *
 *   npm run dev:all              all three
 *   npm run dev:all -- cms site  just those
 *
 * A service already listening on its port is left alone (not started twice).
 * Output is prefixed per service; Ctrl-C stops everything this started.
 * The site runs on 7100 because the CMS (SITE_URL) and Strapi's page refresh
 * (SITE_REVALIDATE_URL) point there.
 */

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/** PORT from the Strapi .env, without loading dotenv. */
function strapiPort() {
  try {
    const match = /^PORT=(\d+)/m.exec(fs.readFileSync(path.join(ROOT, '.env'), 'utf8'));
    if (match) return Number(match[1]);
  } catch {
    // No .env: config/server.js default.
  }
  return 1338;
}

const SERVICES = [
  { name: 'strapi', color: 35, dir: '.', script: 'develop', port: strapiPort(), url: (port) => `http://localhost:${port}/admin`, ready: '/_health' },
  { name: 'cms', color: 36, dir: 'zuse-cms', script: 'dev', port: 3100, url: (port) => `http://localhost:${port}`, ready: '/login' },
  { name: 'site', color: 33, dir: 'zuse-site', script: 'dev:local', port: 7100, url: (port) => `http://localhost:${port}`, ready: '/' },
];

const paint = (color, text) => (process.stdout.isTTY ? `\x1b[${color}m${text}\x1b[0m` : text);
const label = (service) => paint(service.color, `[${service.name.padEnd(6)}]`);
const say = (text) => console.log(paint(1, `[dev:all] ${text}`));

/** True when something already accepts connections on the port (IPv4 or IPv6). */
function listening(port) {
  const attempt = (host) =>
    new Promise((resolve) => {
      const socket = net.connect({ host, port });
      socket.setTimeout(500);
      socket.once('connect', () => (socket.destroy(), resolve(true)));
      socket.once('timeout', () => (socket.destroy(), resolve(false)));
      socket.once('error', () => resolve(false));
    });
  return attempt('127.0.0.1').then((ok) => ok || attempt('::1'));
}

/** Resolves once the service answers HTTP (any status), or gives up after `ms`. */
async function waitForHttp(service, ms = 180000) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    try {
      await fetch(`http://127.0.0.1:${service.port}${service.ready}`, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
      return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
  return false;
}

/** Prefixes each line of a child's output with its name. */
function pipe(stream, service, target) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) target.write(`${label(service)} ${line}\n`);
  });
  stream.on('end', () => buffer && target.write(`${label(service)} ${buffer}\n`));
}

async function main() {
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((name) => !SERVICES.some((service) => service.name === name));
  if (unknown.length) {
    console.error(`Unknown service: ${unknown.join(', ')}. Choose from: ${SERVICES.map((s) => s.name).join(', ')}.`);
    process.exit(1);
  }
  const selected = SERVICES.filter((service) => !wanted.length || wanted.includes(service.name));

  const children = new Map();
  let stopping = false;
  for (const service of selected) {
    const dir = path.join(ROOT, service.dir);
    if (!fs.existsSync(path.join(dir, 'node_modules'))) {
      say(`${service.name}: dependencies missing — run "npm install" in ${service.dir === '.' ? 'this folder' : service.dir}. Skipping.`);
      continue;
    }
    if (await listening(service.port)) {
      say(`${service.name} is already running on port ${service.port} — leaving it as it is.`);
      continue;
    }
    // Own process group, so Ctrl-C can stop each service and everything it started (watchers, workers).
    const child = spawn('npm', ['run', service.script], {
      cwd: dir,
      env: { ...process.env, FORCE_COLOR: '1' },
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipe(child.stdout, service, process.stdout);
    pipe(child.stderr, service, process.stderr);
    child.on('exit', (code, signal) => {
      children.delete(service.name);
      if (!stopping) say(`${service.name} stopped (${signal || `exit code ${code}`}). The others keep running; Ctrl-C to stop them.`);
      if (!children.size && !stopping) process.exit(code || 0);
    });
    children.set(service.name, child);
  }

  const stop = () => {
    if (stopping) return;
    stopping = true;
    say('Stopping…');
    for (const child of children.values()) {
      try {
        process.kill(-child.pid, 'SIGINT');
      } catch {
        // Already gone.
      }
    }
    // Anything still running after a few seconds is ended for good.
    setTimeout(() => {
      for (const child of children.values()) {
        try {
          process.kill(-child.pid, 'SIGKILL');
        } catch {
          // Already gone.
        }
      }
      process.exit(0);
    }, 5000).unref();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);

  if (!children.size) {
    say('Nothing to start.');
    return;
  }

  const results = await Promise.all(selected.map(async (service) => [service, await waitForHttp(service)]));
  if (stopping) return;
  say('Ready:');
  for (const [service, ok] of results) {
    console.log(`  ${label(service)} ${ok ? service.url(service.port) : `not answering on port ${service.port} — see its output above`}`);
  }
}

main();
