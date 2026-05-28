// Next.js instrumentation hook. Carrega o config Sentry apropriado por runtime.
// Veja: https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// captureRequestError é o hook do Next 16 pra capturar erros em RSC/Route Handlers.
// Sentry exporta com este nome em v10+.
export { captureRequestError as onRequestError } from "@sentry/nextjs";
