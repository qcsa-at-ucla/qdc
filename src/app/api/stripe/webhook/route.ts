import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
export const runtime = "nodejs";

function getRegistrationTypeDisplay(type: string): string {
  switch (type) {
    case "student_in_person": return "Student — In Person";
    case "student_online": return "Student — Online";
    case "professional_in_person": return "Professional — In Person";
    case "professional_online": return "Professional — Online";
    default: return type.replace(/_/g, " ");
  }
}

async function sendCongratulationsEmail(meta: Record<string, string>) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!resendApiKey || !fromEmail) {
    console.warn("Resend not configured — skipping congratulations email");
    return;
  }

  const firstName = meta.firstName || "";
  const lastName = meta.lastName || "";
  const email = meta.email || "";
  const registrationType = meta.registrationType || "";

  if (!email) return;

  const resend = new Resend(resendApiKey);
  const registrationTypeDisplay = getRegistrationTypeDisplay(registrationType);
  const memberPortalUrl = `${siteUrl}/qdw/2026/member-only`;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      replyTo: replyToEmail || "quantum.ucla@gmail.com",
      subject: "🎉 You're officially registered for QDW 2026!",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
              <p style="margin: 10px 0 0; font-size: 16px;">You're officially registered for QDW 2026</p>
            </div>

            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="margin: 0 0 20px;">Hi ${firstName},</p>

              <p style="margin: 0 0 20px;">
                Welcome to the <strong>Quantum Device Workshop 2026</strong>! Your registration is now complete and your payment has been received. We're thrilled to have you join us!
              </p>

              <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px;"><strong>Your Registration Details:</strong></p>
                <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${firstName} ${lastName}</p>
                <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0;">🎟️ <strong>Type:</strong> ${registrationTypeDisplay}</p>
              </div>

              <p style="margin: 20px 0;">
                You can now access the member portal using your registered email and password.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${memberPortalUrl}" style="display: inline-block; background-color: #667eea; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px; border: 2px solid #667eea;">
                  Access Member Portal
                </a>
              </div>

              <p style="margin: 0 0 10px; font-size: 14px; color: #666; text-align: center;">Or copy and paste this link into your browser:</p>
              <p style="font-size: 13px; color: #4F46E5; word-break: break-all; margin: 0 0 20px; text-align: center;">${memberPortalUrl}</p>

              <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px;"><strong>📅 What's Next?</strong></p>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Check the event details and schedule on our <a href="${siteUrl}/qdw/2026/info" style="color: #667eea;">event info page</a></li>
                  <li>Log into your member portal to view exclusive content</li>
                  <li>We'll send you updates and reminders as the event approaches</li>
                </ul>
              </div>

              <p style="margin: 20px 0;">
                If you have any questions, feel free to reach out to us at
                <a href="mailto:quantum.ucla@gmail.com" style="color: #667eea;">quantum.ucla@gmail.com</a>.
              </p>

              <p style="margin: 0;">
                See you at QDW 2026!<br>
                <strong>The QDW Team</strong>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p style="margin: 0;">This is an automated email from QDW 2026</p>
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} Quantum Device Workshop. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`✅ Congratulations email sent to ${email}`);
  } catch (emailError) {
    console.error("Failed to send congratulations email:", emailError);
    // Non-fatal — don't break the webhook response
  }
}

// Helper function to save registration to Supabase
async function saveRegistration(
  meta: Record<string, string>,
  paymentIntentId: string | null,
  checkoutSessionId: string | null
) {
  // console.log("=== saveRegistration called ===");
  // console.log("Metadata received:", JSON.stringify(meta, null, 2));
  // console.log("PaymentIntent ID:", paymentIntentId);
  // console.log("Checkout Session ID:", checkoutSessionId);

  const firstName = meta.firstName;
  const email = meta.email;
  const registrationType = meta.registrationType;
  const isApprovedStudent = meta.isApprovedStudent === "true";
  const registrationId = meta.registrationId;
  const isUpgrade = meta.isUpgrade === "true";

  console.log("=== Webhook Processing ===");
  console.log("isUpgrade:", isUpgrade);
  console.log("isApprovedStudent:", isApprovedStudent);
  console.log("registrationId:", registrationId);
  console.log("email:", email);

  // Handle registration type upgrade (online → in-person)
  if (isUpgrade) {
    const newRegistrationType = meta.newRegistrationType;
    console.log(`🔵 UPGRADE PAYMENT DETECTED: ${registrationId} → ${newRegistrationType}`);

    if (!registrationId || !newRegistrationType) {
      console.warn("⚠️ Upgrade missing registrationId or newRegistrationType");
      return { success: false };
    }

    const upgradeSupabaseUrl = process.env.SUPABASE_URL;
    const upgradeServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!upgradeSupabaseUrl || !upgradeServiceKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
      return { success: false, error: "Supabase not configured" };
    }

    const upgradeSupabase = createClient(upgradeSupabaseUrl, upgradeServiceKey);

    const { data, error } = await upgradeSupabase
      .from("qdw_registrations")
      .update({ registration_type: newRegistrationType })
      .eq("id", registrationId)
      .select("id");

    if (error) {
      console.error("❌ Failed to upgrade registration:", error);
      return { success: false, error: "DB upgrade failed" };
    }

    console.log(`✅ Registration upgraded to ${newRegistrationType}: ${data?.[0]?.id}`);
    return { success: true, id: data?.[0]?.id };
  }

  if (!firstName || !email || !registrationType) {
    console.warn(
      "Missing registration data in metadata — cannot save to Supabase.",
      { firstName, email, registrationType }
    );
    return { success: false };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    return { success: false, error: "Supabase not configured" };
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // If this is an approved student, UPDATE the existing record
  if (isApprovedStudent) {
    console.log(`🔵 APPROVED STUDENT PAYMENT DETECTED`);
    
    // Try to find and update the approved student record
    // Use both registrationId and email as lookup to be safe
    let updateQuery;
    
    if (registrationId && registrationId.trim() !== "") {
      console.log(`Updating by ID: ${registrationId}`);
      updateQuery = supabase
        .from("qdw_registrations")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: checkoutSessionId,
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", registrationId);
    } else {
      // Fallback: find by email and approval_status='approved'
      console.warn(`⚠️ No registrationId provided, using email lookup fallback`);
      updateQuery = supabase
        .from("qdw_registrations")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: checkoutSessionId,
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase())
        .eq("approval_status", "approved")
        .is("stripe_payment_intent_id", null); // Only update if not already paid
    }

    const { data, error } = await updateQuery.select();

    if (error) {
      console.error("❌ Supabase update error:", JSON.stringify(error, null, 2));
      return { success: false, error: "DB update failed" };
    }

    if (!data || data.length === 0) {
      console.error(`❌ No approved registration found for email: ${email}, ID: ${registrationId}`);
      console.error(`This would create a duplicate! Blocking insertion.`);
      return { success: false, error: "Approved registration not found - preventing duplicate" };
    }

    console.log(`✅ Approved student registration updated and marked paid: ${data[0].id}`);
    return { success: true, id: data[0].id };
  }

  // Otherwise, INSERT a new record (regular flow for non-students)
  console.log(`📝 Processing regular (non-approved) registration for ${email}`);

  // SAFETY CHECK: Before inserting, check if there's an approved student record for this email
  // This prevents duplicates if the isApprovedStudent flag was somehow lost
  const isStudent = registrationType === 'student_in_person' || registrationType === 'student_online';
  
  if (isStudent) {
    console.log(`🔍 Checking for existing approved student record for ${email}`);
    const { data: existingApproved, error: checkError } = await supabase
      .from("qdw_registrations")
      .select("id, approval_status, payment_status")
      .eq("email", email.toLowerCase())
      .eq("approval_status", "approved")
      .single();

    if (!checkError && existingApproved) {
      console.warn(`⚠️ DUPLICATE PREVENTION: Found approved student record for ${email}`);
      console.warn(`⚠️ This payment was for registration ID: ${existingApproved.id}`);
      console.warn(`⚠️ Updating existing record instead of creating duplicate!`);

      // Update the existing approved record
      const { data: updatedData, error: updateError } = await supabase
        .from("qdw_registrations")
        .update({
          payment_status: "paid",
          stripe_checkout_session_id: checkoutSessionId,
          stripe_payment_intent_id: paymentIntentId,
          paid_at: new Date().toISOString(),
        })
        .eq("id", existingApproved.id)
        .select();

      if (updateError) {
        console.error("❌ Failed to update existing approved record:", updateError);
        return { success: false, error: "Failed to update approved record" };
      }

      console.log(`✅ DUPLICATE PREVENTED! Updated existing approved record: ${existingApproved.id}`);
      return { success: true, id: existingApproved.id };
    }
  }

  // No existing approved record found, safe to insert new record
  // Hash password if provided
  let passwordHash = null;
  if (meta.password) {
    const saltRounds = 10;
    passwordHash = await bcrypt.hash(meta.password, saltRounds);
    console.log("Password hashed successfully");
  }

  const registrationData = {
    first_name: firstName,
    last_name: meta.lastName || "",
    email,
    designation: meta.designation || "",
    location: meta.location || "",
    registration_type: registrationType,
    project_title: meta.projectTitle || null,
    project_description: meta.projectDescription || null,
    // poster_url, cv_url and student_id_photo_url will be updated via verify-registration after payment success page uploads files
    poster_url: null,
    cv_url: null,
    student_id_photo_url: null,
    dietary_restriction: meta.dietaryRestriction || null,
    wants_qdc_membership: meta.wantsQdcMembership === "true",
    agree_to_terms: meta.agreeToTerms === "true",
    payment_status: "paid",
    password_hash: passwordHash,
    stripe_checkout_session_id: checkoutSessionId,
    stripe_payment_intent_id: paymentIntentId,
    paid_at: new Date().toISOString(),
  };

  // console.log("Attempting to insert registration:", JSON.stringify(registrationData, null, 2));

  // INSERT the registration row — data only reaches Supabase after payment
  const { data, error } = await supabase
    .from("qdw_registrations")
    .insert(registrationData)
    .select("id");

  if (error) {
    console.error("Supabase insert error:", JSON.stringify(error, null, 2));
    return { success: false, error: "DB insert failed" };
  }

  // console.log("Registration saved successfully!");
  // console.log("Inserted data:", JSON.stringify(data, null, 2));
  console.log(`✅ New registration created & marked paid: ${data?.[0]?.id}`);
  return { success: true, id: data?.[0]?.id };
}

export async function POST(req: Request) {
  console.log("=== Stripe Webhook Received ===");
  
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    console.error("ERROR: Missing STRIPE_SECRET_KEY");
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!webhookSecret) {
    console.error("ERROR: Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    apiVersion: "2026-01-28.clover" as any,
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    console.error("ERROR: Missing stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    console.log("Raw body length:", rawBody.length);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    console.log("Webhook event verified successfully!");
    console.log("Event type:", event.type);
    console.log("Event ID:", event.id);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle Express Checkout (PaymentIntent) - used by Apple Pay, Google Pay, etc.
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log("PaymentIntent succeeded:", paymentIntent.id);
    console.log("Amount:", paymentIntent.amount);
    console.log("Status:", paymentIntent.status);

    if (paymentIntent.amount === 0) {
      console.log("✓ Processing $0 payment intent");
    }

    const result = await saveRegistration(
      paymentIntent.metadata || {},
      paymentIntent.id,
      null
    );

    if (!result.success && result.error) {
      console.error("Failed to save registration:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Send congratulations email (skip for upgrades)
    if (result.success && paymentIntent.metadata?.isUpgrade !== "true") {
      await sendCongratulationsEmail(paymentIntent.metadata || {});
    }

    console.log("✓ Registration saved successfully!");
    return NextResponse.json({ received: true });
  }

  // Handle Checkout Session (hosted checkout) - fallback method
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Checkout session completed:", session.id);
    console.log("Payment status:", session.payment_status);
    console.log("Amount total:", session.amount_total);
    console.log("Has payment_intent:", !!session.payment_intent);

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;

    // For $0 payments (100% coupons), payment_intent might be null
    // but payment_status will be 'paid' or 'no_payment_required'
    if (session.amount_total === 0 || session.payment_status === "no_payment_required") {
      console.log("✓ Processing $0 payment (100% coupon applied)");
    }

    const result = await saveRegistration(
      session.metadata || {},
      paymentIntentId,
      session.id
    );

    if (!result.success && result.error) {
      console.error("Failed to save registration:", result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Send congratulations email (skip for upgrades)
    if (result.success && session.metadata?.isUpgrade !== "true") {
      await sendCongratulationsEmail(session.metadata || {});
    }

    console.log("✓ Registration saved successfully!");
    return NextResponse.json({ received: true });
  }

  // Log unhandled event types
  console.log("Unhandled event type:", event.type);
  return NextResponse.json({ received: true });
}