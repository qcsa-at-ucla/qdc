import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

/**
 * Admin API - Reject student registration and request new ID upload
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
    const { apiKey, registrationId, reason } = await req.json();

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

    // Check if already processed
    if (registration.approval_status === "approved") {
      return NextResponse.json(
        { error: "Registration already approved" },
        { status: 400 }
      );
    }

    if (registration.approval_status === "rejected") {
      return NextResponse.json(
        { error: "Registration already rejected" },
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

    // Update registration status to rejected
    const { error: updateError } = await supabase
      .from("qdw_registrations")
      .update({
        approval_status: "rejected",
        approved_at: null,
        approved_by: null,
      })
      .eq("id", registrationId);

    if (updateError) {
      console.error("Failed to update registration:", updateError);
      return NextResponse.json(
        { error: "Failed to reject registration" },
        { status: 500 }
      );
    }

    // Build resubmission link
    const resubmitUrl = `${siteUrl}/qdw/2026/registration?reupload=true&email=${encodeURIComponent(registration.email)}`;

    // Default reason if not provided
    const rejectionReason = reason || "The uploaded student ID photo was not clear or does not appear to be a valid student ID.";

    // Send rejection email with resubmission instructions
    try {
      await resend.emails.send({
        from: fromEmail || "QDW 2026 <noreply@qdc-qcsa.org>",
        to: registration.email,
        subject: "Action Required: Please Resubmit Your Student ID - QDW 2026",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 28px;">Student ID Verification Required</h1>
                <p style="margin: 10px 0 0; font-size: 16px;">Your student registration needs attention</p>
              </div>
              
              <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="margin: 0 0 20px;">Hi ${registration.first_name},</p>
                
                <p style="margin: 0 0 20px;">
                  Thank you for your interest in <strong>QDW 2026</strong>. Unfortunately, we were unable to verify your student status with the ID photo you submitted.
                </p>

                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 10px;"><strong>Reason:</strong></p>
                  <p style="margin: 0;">${rejectionReason}</p>
                </div>

                <p style="margin: 20px 0;">
                  <strong>What you need to do:</strong>
                </p>

                <ol style="margin: 0 0 20px; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Take a clear photo of your <strong>valid student ID card</strong></li>
                  <li style="margin-bottom: 10px;">Make sure the ID shows:
                    <ul style="margin: 5px 0; padding-left: 20px;">
                      <li>Your name</li>
                      <li>Your university/institution name</li>
                      <li>Current academic year or expiration date</li>
                      <li>Clear, well-lit, and in focus</li>
                    </ul>
                  </li>
                  <li style="margin-bottom: 10px;">Click the button below to upload your new student ID</li>
                </ol>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resubmitUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    Upload Student ID Now
                  </a>
                </div>

                <div style="background: white; border: 1px solid #d1d5db; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 10px;"><strong>💡 Tips for a good photo:</strong></p>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li>Use good lighting - avoid shadows</li>
                    <li>Ensure all text is readable</li>
                    <li>Take photo straight-on (not at an angle)</li>
                    <li>Accepted formats: JPG, PNG, PDF</li>
                  </ul>
                </div>

                <p style="margin: 20px 0;">
                  Once we receive your new student ID photo, we'll review it promptly. After approval, you'll receive a payment link to complete your registration.
                </p>

                <p style="margin: 20px 0;">
                  If you have any questions or need assistance, please don't hesitate to reach out to our support team.
                </p>

                <p style="margin: 0;">
                  Best regards,<br>
                  <strong>The QDW 2026 Team</strong>
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

      console.log(`Rejection email sent to ${registration.email}`);
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
      // Don't fail the rejection if email fails - admin can manually notify
      return NextResponse.json({
        success: true,
        message: "Registration rejected but email failed to send. Please notify the student manually.",
        warning: "Email delivery failed",
      });
    }

    return NextResponse.json({
      success: true,
      message: `Registration rejected and notification sent to ${registration.email}`,
    });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    return NextResponse.json(
      { error: "Failed to reject registration. Please try again." },
      { status: 500 }
    );
  }
}
