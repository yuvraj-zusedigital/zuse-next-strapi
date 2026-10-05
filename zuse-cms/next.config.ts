import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app sits inside the Strapi repo, which has its own lockfile; keep
  // Turbopack's workspace root here.
  turbopack: { root: __dirname },
  // Docker builds a self-contained server (see Dockerfile); `next start` is used otherwise.
  ...(process.env.NEXT_OUTPUT_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  poweredByHeader: false,
  // The help guides are read from disk at runtime (lib/help.ts); ship them with the server.
  outputFileTracingIncludes: { "/**": ["./content/help/**/*"] },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // An admin tool: never framed (clickjacking), never indexed, no MIME sniffing.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
