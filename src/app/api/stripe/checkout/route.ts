import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover" as any,
});

type RegistrationType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

function getPriceId(type: RegistrationType) {
  const map: Record<RegistrationType, string | undefined> = {
    student_in_person: process.env.STRIPE_PRICE_STUDENT_IN_PERSON,
    student_online: process.env.STRIPE_PRICE_STUDENT_ONLINE,
    professional_in_person: process.env.STRIPE_PRICE_PROFESSIONAL_IN_PERSON,
    professional_online: process.env.STRIPE_PRICE_PROFESSIONAL_ONLINE,
  };
  return map[type];
}

export async function POST(req: Request) {
  try {
    const { registrationType, email, registrationData } = (await req.json()) as {
      registrationType: RegistrationType;
      email?: string;
      registrationData?: Record<string, any>;
    };

    const priceId = getPriceId(registrationType);
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing price id for registration type" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    // Store ALL registration fields in Stripe session metadata so the
    // webhook can INSERT the row into Supabase only after payment succeeds.
    // Stripe metadata: max 50 keys, each value max 500 chars.
    const metadata: Record<string, string> = {};

    if (registrationData) {
      metadata.firstName = String(registrationData.firstName || "").slice(0, 500);
      metadata.lastName = String(registrationData.lastName || "").slice(0, 500);
      metadata.email = String(registrationData.email || email || "").slice(0, 500);
      metadata.password = String(registrationData.password || "").slice(0, 500);
      metadata.designation = String(registrationData.designation || "").slice(0, 500);
      metadata.location = String(registrationData.location || "").slice(0, 500);
      metadata.registrationType = String(registrationData.registrationType || registrationType).slice(0, 500);
      metadata.projectTitle = String(registrationData.projectTitle || "").slice(0, 500);
      metadata.projectDescription = String(registrationData.projectDescription || "").slice(0, 500);
      metadata.posterUrl = String(registrationData.posterUrl || "").slice(0, 500);
      metadata.wantsQdcMembership = registrationData.wantsQdcMembership ? "true" : "false";
      metadata.agreeToTerms = registrationData.agreeToTerms ? "true" : "false";
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      allow_promotion_codes: true,

      metadata,

      success_url: `${baseUrl}/qdw/2026/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/qdw/2026/payment/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}