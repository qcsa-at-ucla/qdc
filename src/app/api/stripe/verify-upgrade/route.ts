import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Backup verification for upgrade payments — called by the success page
// in case the webhook hasn't fired yet.
export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!stripeSecret || !supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2026-01-28.clover" as any });
    const supabase = createClient(supabaseUrl, serviceKey);

    // Retrieve the Stripe session to confirm payment
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const meta = session.metadata || {};

    if (meta.isUpgrade !== "true") {
      return NextResponse.json({ error: "Invalid upgrade session" }, { status: 400 });
    }

    const { registrationId, newRegistrationType } = meta;

    if (!registrationId || !newRegistrationType) {
      return NextResponse.json({ error: "Missing upgrade metadata" }, { status: 400 });
    }

    // Check current state — webhook may have already processed it
    const { data: current } = await supabase
      .from("qdw_registrations")
      .select("id, registration_type")
      .eq("id", registrationId)
      .single();

    if (current?.registration_type === newRegistrationType) {
      // Webhook already handled it — nothing to do
      return NextResponse.json({ success: true, alreadyUpgraded: true });
    }

    // Update the registration type
    const { error: updateError } = await supabase
      .from("qdw_registrations")
      .update({ registration_type: newRegistrationType })
      .eq("id", registrationId);

    if (updateError) {
      console.error("Failed to upgrade registration type:", updateError);
      return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
    }

    console.log(`Registration ${registrationId} upgraded to ${newRegistrationType} via verify-upgrade`);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error verifying upgrade:", err);
    return NextResponse.json({ error: "Failed to verify upgrade" }, { status: 500 });
  }
}
