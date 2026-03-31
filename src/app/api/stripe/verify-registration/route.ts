import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover" as any,
  });
}

// Verify if registration was saved, and save it if missing (backup for webhook delays/failures)
// Also updates the registration with file URLs uploaded after payment
export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    
    const { sessionId, cvUrl, posterUrl, studentIdPhotoUrl } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if registration already exists
    const { data: existing } = await supabase
      .from("qdw_registrations")
      .select("id")
      .eq("stripe_checkout_session_id", sessionId)
      .single();

    if (existing) {
      console.log("✓ Registration already exists for session:", sessionId);
      
      // Update with file URLs if provided
      if (cvUrl || posterUrl || studentIdPhotoUrl) {
        const updateData: Record<string, string> = {};
        if (cvUrl) updateData.cv_url = cvUrl;
        if (posterUrl) updateData.poster_url = posterUrl;
        if (studentIdPhotoUrl) updateData.student_id_photo_url = studentIdPhotoUrl;
        
        const { error: updateError } = await supabase
          .from("qdw_registrations")
          .update(updateData)
          .eq("id", existing.id);
        
        if (updateError) {
          console.error("Failed to update file URLs:", updateError);
        } else {
          console.log("✓ Updated file URLs for registration:", existing.id);
        }
        
        return NextResponse.json({ 
          status: "updated", 
          message: "Registration updated with file URLs",
          id: existing.id 
        });
      }
      
      return NextResponse.json({ 
        status: "exists", 
        message: "Registration already saved",
        id: existing.id 
      });
    }

    // Registration not found - retrieve session from Stripe and save it
    console.log("⚠ Registration not found for session:", sessionId);
    console.log("Retrieving session from Stripe...");

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json({ 
        status: "not_paid", 
        message: "Payment not completed" 
      }, { status: 400 });
    }

    const meta = session.metadata || {};

    // Validate required fields
    if (!meta.firstName || !meta.email || !meta.registrationType) {
      console.error("Missing required metadata:", { 
        firstName: meta.firstName, 
        email: meta.email, 
        registrationType: meta.registrationType 
      });
      return NextResponse.json({ 
        status: "error", 
        message: "Missing registration data in Stripe session" 
      }, { status: 400 });
    }

    // Hash password if provided
    let passwordHash = null;
    if (meta.password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(meta.password, saltRounds);
    }

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;

    const registrationData = {
      first_name: meta.firstName,
      last_name: meta.lastName || "",
      email: meta.email,
      designation: meta.designation || "",
      location: meta.location || "",
      registration_type: meta.registrationType,
      project_title: meta.projectTitle || null,
      project_description: meta.projectDescription || null,
      poster_url: posterUrl || null,
      cv_url: cvUrl || null,
      student_id_photo_url: studentIdPhotoUrl || null,
      wants_qdc_membership: meta.wantsQdcMembership === "true",
      agree_to_terms: meta.agreeToTerms === "true",
      payment_status: "paid",
      password_hash: passwordHash,
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      paid_at: new Date().toISOString(),
    };

    console.log("Saving registration via backup verification...");

    const { data, error } = await supabase
      .from("qdw_registrations")
      .insert(registrationData)
      .select("id");

    if (error) {
      console.error("Failed to save registration:", error);
      return NextResponse.json({ 
        status: "error", 
        message: "Failed to save registration" 
      }, { status: 500 });
    }

    console.log("✓ Registration saved successfully via backup:", data?.[0]?.id);

    return NextResponse.json({ 
      status: "saved", 
      message: "Registration saved successfully",
      id: data?.[0]?.id 
    });
  } catch (error: any) {
    console.error("Error verifying registration:", error);
    return NextResponse.json({ 
      status: "error", 
      message: error?.message || "Failed to verify registration" 
    }, { status: 500 });
  }
}
