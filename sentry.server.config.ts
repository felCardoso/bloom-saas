// Sentry — runtime Node.js (Server Actions, API Routes, RSC).
// No-op se SENTRY_DSN não estiver setado (dev local, PRs de preview sem DSN, etc.)

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    enabled: process.env.NODE_ENV === "production",
    // PII fica off por padrão; ative se LGPD permitir e quiser email/IP no painel.
    sendDefaultPii: false,
  });
}
