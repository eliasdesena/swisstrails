import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createAdminClient();

  // Use type assertions to bypass generated-type constraints until Supabase types are generated
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (!userId) break;

      await db.from("purchases").insert({
        id: crypto.randomUUID(),
        user_id: userId,
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string" ? session.payment_intent : null,
        amount: (session.amount_total ?? 2900) / 100,
        currency: session.currency ?? "chf",
        status: "completed",
      });

      await db
        .from("profiles")
        .update({
          has_purchased: true,
          purchased_at: new Date().toISOString(),
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
        })
        .eq("id", userId);

      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      if (!paymentIntentId) break;

      await db
        .from("purchases")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent_id", paymentIntentId);

      const { data: purchase } = await db
        .from("purchases")
        .select("user_id")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .single();

      if (purchase?.user_id) {
        await db
          .from("profiles")
          .update({ has_purchased: false, purchased_at: null })
          .eq("id", purchase.user_id);
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
