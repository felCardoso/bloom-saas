import webpush from "web-push";

const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT ?? "mailto:contato@bloom.app.br";

webpush.setVapidDetails(
  VAPID_SUBJECT,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export type PushPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
};

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload,
): Promise<"ok" | "expired" | "error"> {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return "ok";
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    if (status === 410 || status === 404) return "expired";
    console.error("Push error:", err);
    return "error";
  }
}
