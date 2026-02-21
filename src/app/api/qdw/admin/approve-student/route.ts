import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

/**
 * Admin API - Approve student registration and send payment link
 * 
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - ADMIN_API_KEY
 *   - RESEND_API_KEY
 *   - RESEND_FROM_EMAIL
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

    // Check if already approved
    if (registration.approval_status === "approved") {
      return NextResponse.json(
        { error: "Registration already approved" },
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

    // Update registration status to approved
    const { error: updateError } = await supabase
      .from("qdw_registrations")
      .update({
        approval_status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: "admin",
      })
      .eq("id", registrationId);

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return NextResponse.json(
        { error: "Failed to approve registration" },
        { status: 500 }
      );
    }

    // Build payment link with approval token
    const paymentUrl = `${siteUrl}/qdw/2026/payment?approved=true&email=${encodeURIComponent(registration.email)}&token=${registration.approval_token}`;

    // Get registration type display name
    const registrationTypeDisplay = 
      registration.registration_type === 'student_in_person' 
        ? 'Student - In Person ($60)'
        : 'Student - Online ($30)';

    // Send approval email with payment link
    try {
      await resend.emails.send({
        from: fromEmail || "QDW 2026 <noreply@qdc-qcsa.org>",
        to: registration.email,
        subject: "Your QDW 2026 Student Registration Has Been Approved! 🎉",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Congratulations!</h1>
                <p style="margin: 10px 0 0; font-size: 16px;">Your student registration has been approved</p>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="margin: 0 0 20px;">Hi ${registration.first_name},</p>
                
                <p style="margin: 0 0 20px;">
                  Great news! Your student status has been verified and your registration for <strong>QDW 2026</strong> has been approved.
                </p>

                <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px;"><strong>Registration Details:</strong></p>
                  <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${registration.first_name} ${registration.last_name}</p>
                  <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${registration.email}</p>
                  <p style="margin: 5px 0;">🎓 <strong>Type:</strong> ${registrationTypeDisplay}</p>
                </div>

                <p style="margin: 20px 0;">
                  <strong>Next Step:</strong> Complete your payment to finalize your registration.
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
                    <li>The link will expire in 7 days</li>
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

      console.log(`Approval email sent to ${registration.email}`);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
      // Don't fail the approval if email fails - admin can manually notify
      return NextResponse.json({
        success: true,
        message: "Registration approved but email failed to send. Please notify the student manually.",
        warning: "Email delivery failed",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Registration approved and payment link sent to ${registration.email}`,
    });
  } catch (error) {
    console.error("Error approving registration:", error);
    return NextResponse.json(
      { error: "Failed to approve registration. Please try again." },
      { status: 500 }
    );
  }
}
