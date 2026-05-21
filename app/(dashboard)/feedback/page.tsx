import { getFeedbacks } from "@/lib/actions/feedback";
import FeedbackClient from "./_client";

export const metadata = {
  title: "Feedback — Bloom",
  robots: { index: false, follow: false },
};

export default async function FeedbackPage() {
  const initialFeedbacks = await getFeedbacks();
  return <FeedbackClient initialFeedbacks={initialFeedbacks} />;
}
