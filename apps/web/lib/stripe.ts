import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const STRIPE_CONFIG = {
  PRODUCT_ID: process.env.STRIPE_PRODUCT_ID ?? "",
  PRICE_ID: process.env.STRIPE_PRICE_ID ?? "",
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  SUCCESS_URL: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  CANCEL_URL: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
};

export async function createCheckoutSession(
  userId: string,
  email: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price: STRIPE_CONFIG.PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      userId,
    },
    success_url: STRIPE_CONFIG.SUCCESS_URL,
    cancel_url: STRIPE_CONFIG.CANCEL_URL,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  });

  return session.url!;
}

export async function getOrCreateCustomer(
  email: string,
  name?: string
): Promise<string> {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_CONFIG.WEBHOOK_SECRET
  );
}
