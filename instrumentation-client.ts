// Sentry — runtime browser. Next.js carrega automaticamente este arquivo no client.
// No-op se NEXT_PUBLIC_SENTRY_DSN não estiver setado.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Session Replay desligado por padrão (custo + privacidade). Ative com:
    //   replaysSessionSampleRate: 0.01,
    //   replaysOnErrorSampleRate: 1.0,
    //   integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
    enabled: process.env.NODE_ENV === "production",
    sendDefaultPii: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
