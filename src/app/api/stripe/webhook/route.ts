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
    const meta = session.metadata || {};

    console.log("session.id:", session.id);

    // Registration data is stored entirely in Stripe metadata.
    // We INSERT a new row in Supabase only now (after successful payment).
    const firstName = meta.firstName;
    const email = meta.email;
    const registrationType = meta.registrationType;

    if (!firstName || !email || !registrationType) {
      console.warn(
        "Missing registration data in session metadata — cannot save to Supabase.",
        { firstName, email, registrationType }
      );
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

    // INSERT the registration row — data only reaches Supabase after payment
    const { data, error } = await supabase
      .from("qdw_registrations")
      .insert({
        first_name: firstName,
        last_name: meta.lastName || "",
        email,
        designation: meta.designation || "",
        location: meta.location || "",
        registration_type: registrationType,
        project_title: meta.projectTitle || null,
        project_description: meta.projectDescription || null,
        poster_url: meta.posterUrl || null,
        wants_qdc_membership: meta.wantsQdcMembership === "true",
        agree_to_terms: meta.agreeToTerms === "true",
        payment_status: "paid",
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId,
        paid_at: new Date().toISOString(),
      })
      .select("id");

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    console.log(`Registration saved & marked paid: ${data?.[0]?.id}`);
  }

  return NextResponse.json({ received: true });
}