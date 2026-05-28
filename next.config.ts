import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const supabaseHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    ).hostname;
  } catch {
    return "https://placeholder.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  serverExternalPackages: ["web-push", "xlsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

// withSentryConfig é seguro de aplicar sempre — quando SENTRY_AUTH_TOKEN não está
// presente (dev local, PRs sem env), upload de sourcemaps é silenciosamente skippado.
export default withSentryConfig(nextConfig, {
  // Org/project só são consumidos no upload de sourcemaps em build production.
  // Setar via env (SENTRY_ORG, SENTRY_PROJECT, SENTRY_AUTH_TOKEN) na Vercel.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // Tunnela requests Sentry pra /monitoring evita ad-blockers (instala route handler).
  tunnelRoute: "/monitoring",
  disableLogger: true,
  automaticVercelMonitors: true,
});
