import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret);

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

    if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
    }

  // Only process successful checkout completion
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log("session.id:", session.id);

    const registrationId = session.metadata?.registrationId;

    console.log("Payment confirmed:", registrationId);

    if (!registrationId) {
      console.warn("Missing metadata.registrationId — cannot update Supabase.");
      return NextResponse.json({ received: true });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;

    // Update row + return which ids were updated
    const { data, error } = await supabase
      .from("registrations")
      .update({
        payment_status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .eq("id", registrationId)
      .select("id");

    console.log("supabase update data:", data);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(
        `Supabase update matched 0 rows. registrationId=${registrationId}`
      );
    } else {
      console.log(`Marked registration paid: ${registrationId}`);
    }
  }

  return NextResponse.json({ received: true });
}