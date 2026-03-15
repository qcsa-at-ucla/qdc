import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Upgrade amounts in cents (difference between in-person and online prices)
const UPGRADE_INFO: Record<string, { amount: number; newType: string; label: string; displayPrice: string }> = {
  student_online: {
    amount: 3000, // $30 (in-person $60 - online $30)
    newType: "student_in_person",
    label: "Student In-Person Upgrade",
    displayPrice: "$30",
  },
  professional_online: {
    amount: 15000, // $150 (in-person $300 - online $150)
    newType: "professional_in_person",
    label: "Professional In-Person Upgrade",
    displayPrice: "$150",
  },
};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!supabaseUrl || !serviceKey || !stripeSecret || !siteUrl) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Look up the user's registration
    const { data: registration, error: fetchError } = await supabase
      .from("qdw_registrations")
      .select("id, email, first_name, last_name, registration_type, payment_status")
      .eq("email", email.toLowerCase())
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    if (registration.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed for current registration" }, { status: 400 });
    }

    const upgradeInfo = UPGRADE_INFO[registration.registration_type];
    if (!upgradeInfo) {
      return NextResponse.json({
        error: "Your current registration type is not eligible for an in-person upgrade",
      }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2026-01-28.clover" as any });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `QDW 2026 — ${upgradeInfo.label}`,
            description: `Upgrade from online to in-person attendance. You are only charged the difference (${upgradeInfo.displayPrice}).`,
          },
          unit_amount: upgradeInfo.amount,
        },
        quantity: 1,
      }],
      customer_email: registration.email,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      payment_intent_data: { receipt_email: registration.email },
      metadata: {
        isUpgrade: "true",
        registrationId: String(registration.id),
        email: registration.email,
        firstName: registration.first_name,
        lastName: registration.last_name,
        newRegistrationType: upgradeInfo.newType,
      },
      success_url: `${siteUrl}/qdw/2026/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/qdw/2026/member-only`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating upgrade checkout:", err);
    return NextResponse.json({ error: "Failed to create upgrade checkout" }, { status: 500 });
  }
}
