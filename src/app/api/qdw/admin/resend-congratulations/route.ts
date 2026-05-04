import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

/**
 * Admin API - Resend congratulations/welcome email to a paid participant
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - ADMIN_API_KEY
 *   - RESEND_API_KEY
 *   - RESEND_FROM_EMAIL
 *   - RESEND_REPLY_TO_EMAIL (optional)
 *   - NEXT_PUBLIC_SITE_URL
 */

function getRegistrationTypeDisplay(type: string): string {
  switch (type) {
    case "student_in_person":
      return "Student — In Person";
    case "student_online":
      return "Student — Online";
    case "professional_in_person":
      return "Professional — In Person";
    case "professional_online":
      return "Professional — Online";
    default:
      return type.replace(/_/g, " ");
  }
}

export async function POST(req: Request) {
  try {
    const { apiKey, registrationId } = await req.json();

    // Validate API key
    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!supabaseUrl || !serviceKey || !resendApiKey || !fromEmail || !siteUrl) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendApiKey);

    // Fetch registration
    const { data: registration, error: fetchError } = await supabase
      .from("qdw_registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    if (registration.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Participant has not paid yet. Cannot send congratulations email." },
        { status: 400 }
      );
    }

    const registrationTypeDisplay = getRegistrationTypeDisplay(
      registration.registration_type
    );
    const memberPortalUrl = `${siteUrl}/qdw/2026/member-only`;

    await resend.emails.send({
      from: fromEmail,
      to: registration.email,
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
              <p style="margin: 0 0 20px;">Hi ${registration.first_name},</p>

              <p style="margin: 0 0 20px;">
                Welcome to the <strong>Quantum Device Workshop 2026</strong>! Your registration is now complete and your payment has been received. We're thrilled to have you join us!
              </p>

              <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 10px;"><strong>Your Registration Details:</strong></p>
                <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${registration.first_name} ${registration.last_name}</p>
                <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${registration.email}</p>
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

    console.log(`Congratulations email resent to ${registration.email}`);

    return NextResponse.json({
      success: true,
      message: `Congratulations email sent to ${registration.email}`,
    });
  } catch (error) {
    console.error("Error resending congratulations email:", error);
    return NextResponse.json(
      { error: "Failed to send congratulations email. Please try again." },
      { status: 500 }
    );
  }
}
