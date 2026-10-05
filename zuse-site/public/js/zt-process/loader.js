/**
 * Bootstrap for zt-process ParticleField (vendored Turbopack chunks).
 * Loads stages + ParticleField, then binds to #process-canvas.
 */
(function () {
  "use strict";

  const STAGE_MOD = 72520;
  // Stages factory registers exports on 83940 (not 72520). Tuning APIs live there.
  const TUNING_MOD = 83940;
  const FIELD_MOD = 53840;

  function createRuntime() {
    const modules = Object.create(null);
    const cache = Object.create(null);

    function ensureEntry(id) {
      if (!modules[id]) {
        modules[id] = { exports: {}, factory: null, evaluated: false };
      }
      return modules[id];
    }

    function createContext(id) {
      const entry = ensureEntry(id);
      const exports = entry.exports;

      const e = {
        s(bindings, asId) {
          const targetId = asId != null ? asId : id;
          const targetEntry = ensureEntry(targetId);
          const target = targetEntry.exports;
          for (let i = 0; i < bindings.length; i += 3) {
            const key = bindings[i];
            const val = bindings[i + 2];
            Object.defineProperty(target, key, {
              enumerable: true,
              configurable: true,
              writable: true,
              value: val,
            });
          }
          if (targetId !== id) targetEntry.evaluated = true;
        },
        i(reqId) {
          return load(reqId);
        },
        j(reqId) {
          return Promise.resolve(load(reqId));
        },
        v() { },
        n(fn) {
          return fn;
        },
      };

      return { exports, e };
    }

    function load(id) {
      if (cache[id]) return cache[id];
      const entry = ensureEntry(id);
      if (entry.evaluated && entry.exports && Object.keys(entry.exports).length) {
        cache[id] = entry.exports;
        return entry.exports;
      }
      if (!entry.factory) {
        if (Object.keys(entry.exports).length) {
          cache[id] = entry.exports;
          return entry.exports;
        }
        throw new Error("[zt-process] missing module " + id);
      }
      entry.evaluated = true;
      const ctx = createContext(id);
      cache[id] = ctx.exports;
      entry.factory(ctx.e);
      return ctx.exports;
    }

    function registerPush(args) {
      let i = 1;
      while (i < args.length) {
        const a = args[i];
        const b = args[i + 1];
        const c = args[i + 2];
        if (typeof a === "number" && typeof b === "number" && typeof c === "function") {
          ensureEntry(a).factory = c;
          ensureEntry(b).factory = c;
          i += 3;
        } else if (typeof a === "number" && typeof b === "function") {
          ensureEntry(a).factory = b;
          i += 2;
        } else {
          i += 1;
        }
      }
    }

    const queue = Array.isArray(globalThis.TURBOPACK) ? globalThis.TURBOPACK.slice() : [];
    globalThis.TURBOPACK = queue;
    globalThis.TURBOPACK.push = function (chunk) {
      registerPush(chunk);
      return Array.prototype.push.call(this, chunk);
    };
    queue.forEach((chunk) => registerPush(chunk));

    return { load };
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-zt-src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.async = false;
      s.dataset.ztSrc = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load " + src));
      document.body.appendChild(s);
    });
  }

  async function boot() {
    const canvas = document.getElementById("process-canvas");
    const frame =
      document.getElementById("process-canvas-wrapper") || canvas?.parentElement;
    if (!canvas || !frame) return;

    if (window.__ztProcessField) {
      try {
        window.__ztProcessField.dispose?.();
      } catch (_) { }
      window.__ztProcessField = null;
    }

    // Fresh runtime each boot so re-mount works in Gatsby
    delete globalThis.TURBOPACK;
    const runtime = createRuntime();

    // Re-inject chunks if already in DOM (Gatsby remount)
    document.querySelectorAll("script[data-zt-src]").forEach((el) => el.remove());

    await loadScript("/js/zt-process/stages.js");
    await loadScript("/js/zt-process/particle-field.js");

    let fieldMod;
    let tuningApi;
    try {
      runtime.load(STAGE_MOD);
      tuningApi = runtime.load(TUNING_MOD);
      fieldMod = runtime.load(FIELD_MOD);
    } catch (err) {
      console.warn("[zt-process] module load failed", err);
      return;
    }

    const ParticleField = fieldMod && fieldMod.ParticleField;
    if (typeof ParticleField !== "function") {
      console.warn("[zt-process] ParticleField export missing", fieldMod);
      return;
    }

    // Brand blues + snappy morph (override any stored tuning).
    // lineWidth must stay > 1.02 or ParticleField falls back to native GL
    // lines (fixed ~1px, no tuning). Steps 1, 2 & 4 use denser trails — thinner strokes.
    // Step 5 (Optimise) reads soft/faded — push width + opacity for a sharper stroke.
    const BASE_LINE_WIDTH = 2.7;
    const THIN_LINE_WIDTH = 1.15;
    const STEP5_LINE_WIDTH = 3.4;
    const BASE_LINE_OPACITY = 0.82;
    const STEP5_LINE_OPACITY = 1;
    // 0-based stage indices: step 1, step 2, step 4
    const THIN_LINE_STEPS = new Set([0, 1, 3]);
    const STEP5_INDEX = 4;
    let field = null;

    function applyStageLineTuning(idx) {
      const lineWidth =
        idx === STEP5_INDEX
          ? STEP5_LINE_WIDTH
          : THIN_LINE_STEPS.has(idx)
            ? THIN_LINE_WIDTH
            : BASE_LINE_WIDTH;
      const lineOpacity =
        idx === STEP5_INDEX ? STEP5_LINE_OPACITY : BASE_LINE_OPACITY;
      try {
        const current =
          typeof tuningApi.tuning === "function" ? tuningApi.tuning() : {};
        tuningApi.setTuning?.({ ...current, lineWidth, lineOpacity });
      } catch (_) {}
      try {
        field?.applyLineWidth?.(lineWidth);
      } catch (_) {}
    }

    try {
      tuningApi.clearStoredTuning?.();
      const base =
        typeof tuningApi.defaultTuning === "function"
          ? tuningApi.defaultTuning()
          : typeof tuningApi.tuning === "function"
            ? tuningApi.tuning()
            : {};
      tuningApi.setTuning?.({
        ...base,
        morphMs: 650,
        lineWidth: THIN_LINE_WIDTH,
        lineOpacity: BASE_LINE_OPACITY,
        colourDeep: "#234ae8",
        colourMid: "#234ae8",
        colourLight: "#234ae8",
      });
    } catch (_) {}

    field = new ParticleField(canvas, frame);
    window.__ztProcessField = field;
    applyStageLineTuning(0);
    window.setProcessStage = (idx) => {
      applyStageLineTuning(idx);
      if (field && typeof field.setStage === "function") field.setStage(idx);
    };
    window.setProcessStage(0);
  }

  window.__ztProcessBoot = boot;
  // Boot is triggered from home-v3.js after the canvas mounts
})();
