import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export const PRICE_TO_PLAN: Record<string, "pro" | "premium"> = {
  [process.env.STRIPE_PRO_PRICE_ID ?? ""]: "pro",
  [process.env.STRIPE_PREMIUM_PRICE_ID ?? ""]: "premium",
};

export const PLAN_TO_PRICE: Record<string, string> = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
  premium: process.env.STRIPE_PREMIUM_PRICE_ID ?? "",
};
