import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

type RegistrationType =
  | "student_in_person"
  | "student_online"
  | "professional_in_person"
  | "professional_online";

function getAmount(type: RegistrationType): number {
  // Return amount in cents
  const prices: Record<RegistrationType, number> = {
    student_in_person: 3000, // $30.00
    student_online: 1500, // $15.00
    professional_in_person: 10000, // $100.00
    professional_online: 5000, // $50.00
  };
  return prices[type];
}

export async function POST(req: Request) {
  try {
    const { registrationType, email, registrationData } = (await req.json()) as {
      registrationType: RegistrationType;
      email?: string;
      registrationData?: Record<string, any>;
    };

    if (!registrationType) {
      return NextResponse.json(
        { error: "Missing registration type" },
        { status: 400 }
      );
    }

    const amount = getAmount(registrationType);

    // Store ALL registration fields in PaymentIntent metadata
    // so the webhook can INSERT the row into Supabase after payment succeeds
    const metadata: Record<string, string> = {};

    if (registrationData) {
      metadata.firstName = String(registrationData.firstName || "").slice(0, 500);
      metadata.lastName = String(registrationData.lastName || "").slice(0, 500);
      metadata.email = String(registrationData.email || email || "").slice(0, 500);
      metadata.designation = String(registrationData.designation || "").slice(0, 500);
      metadata.location = String(registrationData.location || "").slice(0, 500);
      metadata.registrationType = String(registrationData.registrationType || registrationType).slice(0, 500);
      metadata.projectTitle = String(registrationData.projectTitle || "").slice(0, 500);
      metadata.projectDescription = String(registrationData.projectDescription || "").slice(0, 500);
      metadata.posterUrl = String(registrationData.posterUrl || "").slice(0, 500);
      metadata.wantsQdcMembership = registrationData.wantsQdcMembership ? "true" : "false";
      metadata.agreeToTerms = registrationData.agreeToTerms ? "true" : "false";
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("Error creating payment intent:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
