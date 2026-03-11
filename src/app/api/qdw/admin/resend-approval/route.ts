import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

/**
 * Admin API - Resend approval notification to already-approved student
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

export async function POST(req: Request) {
  try {
    const { apiKey, registrationId } = await req.json();

    // Validate API key
    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
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

    // Get registration details
    const { data: registration, error: fetchError } = await supabase
      .from("qdw_registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    if (fetchError || !registration) {
      console.error("Failed to fetch registration:", fetchError);
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Check if student is approved (but not paid yet)
    if (registration.approval_status !== "approved") {
      return NextResponse.json(
        { error: "Registration must be approved before resending notification" },
        { status: 400 }
      );
    }

    if (registration.payment_status === "paid") {
      return NextResponse.json(
        { error: "Student has already paid. No need to resend approval notification." },
        { status: 400 }
      );
    }

    // Check if this is a student registration
    const isStudent = 
      registration.registration_type === 'student_in_person' || 
      registration.registration_type === 'student_online';

    if (!isStudent) {
      return NextResponse.json(
        { error: "Only student registrations require approval" },
        { status: 400 }
      );
    }

    // Build payment link with approval token (same as original)
    const paymentUrl = `${siteUrl}/qdw/2026/payment?approved=true&email=${encodeURIComponent(registration.email)}&token=${registration.approval_token}`;

    // Get registration type display name
    const registrationTypeDisplay = 
      registration.registration_type === 'student_in_person' 
        ? 'Student - In Person ($60)'
        : 'Student - Online ($30)';

    // Send approval email with payment link (same email as original approval)
    try {
      await resend.emails.send({
        from: fromEmail || "QDW 2026 <qdw2026@qdc-qcsa.org>",
        to: registration.email,
        replyTo: replyToEmail || "quantum.ucla@gmail.com",
        subject: "Reminder: Complete Your QDW 2026 Payment 🎉",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Payment Reminder</h1>
                <p style="margin: 10px 0 0; font-size: 16px;">Your QDW 2026 registration is approved</p>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="margin: 0 0 20px;">Hi ${registration.first_name},</p>
                
                <p style="margin: 0 0 20px;">
                  This is a friendly reminder that your student status has been verified and your registration for <strong>QDW 2026</strong> has been approved.
                </p>

                <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px;"><strong>Registration Details:</strong></p>
                  <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${registration.first_name} ${registration.last_name}</p>
                  <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${registration.email}</p>
                  <p style="margin: 5px 0;">🎓 <strong>Type:</strong> ${registrationTypeDisplay}</p>
                </div>

                <p style="margin: 20px 0;">
                  <strong>Action Required:</strong> Please complete your payment to finalize your registration and secure your spot.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    Complete Payment Now
                  </a>
                </div>

                <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 10px;"><strong>⚠️ Important:</strong></p>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>This payment link is secure and unique to your registration</li>
                    <li>Use the same email address (${registration.email}) when paying</li>
                    <li>You will receive a receipt after successful payment</li>
                  </ul>
                </div>

                <p style="margin: 20px 0;">
                  If you have any questions or need assistance, please don't hesitate to reach out to our support team.
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

      console.log(`Approval reminder email sent to ${registration.email}`);
    } catch (emailError) {
      console.error("Failed to send approval reminder email:", emailError);
      return NextResponse.json({
        success: false,
        error: "Failed to send email. Please try again.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Approval reminder sent to ${registration.email}`,
    });
  } catch (error) {
    console.error("Error resending approval notification:", error);
    return NextResponse.json(
      { error: "Failed to resend notification. Please try again." },
      { status: 500 }
    );
  }
}
