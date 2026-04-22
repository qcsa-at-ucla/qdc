import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";

/**
 * Registration API - Saves user registration data to Supabase
 *
 * Required environment variables:
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_KEY
 *   - ADMIN_API_KEY (for GET endpoint)
 */

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  location: string;
  registrationType: string;
  projectTitle: string;          // optional
  projectDescription: string;    // optional
  posterUrl?: string;
  wantsQdcMembership: boolean;
  agreeToTerms: boolean;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ["firstName", "lastName", "email", "designation", "location", "registrationType"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check terms agreement
    if (!body.agreeToTerms) {
      return NextResponse.json({ error: "You must agree to the Terms & Conditions" }, { status: 400 });
    }

    const registrationData: RegistrationData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email.trim().toLowerCase(),
      designation: body.designation || "",
      location: body.location || "",
      registrationType: body.registrationType,
      projectTitle: body.projectTitle || "",
      projectDescription: body.projectDescription || "",
      posterUrl: body.posterUrl,
      wantsQdcMembership: Boolean(body.wantsQdcMembership),
      agreeToTerms: Boolean(body.agreeToTerms),
      createdAt: new Date().toISOString(),
    };

    // Check if this is a student registration
    const isStudent = 
      body.registrationType === 'student_in_person' || 
      body.registrationType === 'student_online';

    // Hash password if provided
    let passwordHash = null;
    if (body.password) {
      const saltRounds = 10;
      passwordHash = await bcrypt.hash(body.password, saltRounds);
    }

    // Generate approval token for students
    let approvalToken = null;
    let approvalStatus = null;
    
    if (isStudent) {
      approvalToken = crypto.randomBytes(32).toString('hex');
      approvalStatus = 'pending';
    }

    // Insert into Supabase (return inserted row)
    const response = await fetch(`${supabaseUrl}/rest/v1/qdw_registrations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        first_name: registrationData.firstName,
        last_name: registrationData.lastName,
        email: registrationData.email,
        password_hash: passwordHash,
        designation: registrationData.designation,
        location: registrationData.location,
        registration_type: registrationData.registrationType,
        project_title: registrationData.projectTitle || null,
        project_description: registrationData.projectDescription || null,
        poster_url: registrationData.posterUrl || null,
        student_id_photo_url: null,
        dietary_restriction: body.dietaryRestriction || null,
        wants_qdc_membership: registrationData.wantsQdcMembership,
        agree_to_terms: registrationData.agreeToTerms,
        approval_status: approvalStatus,
        approval_token: approvalToken,
        payment_status: isStudent ? 'pending' : 'pending',
        created_at: registrationData.createdAt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase error:", errorText);
      return NextResponse.json(
        { error: "Failed to save registration" },
        { status: 500 }
      );
    }

    // Supabase returns an array of inserted rows
    const inserted = await response.json();
    const id = inserted?.[0]?.id;

    if (!id) {
      console.error("Inserted row missing id:", inserted);
      return NextResponse.json(
        { error: "Registration saved, but missing id" },
        { status: 500 }
      );
    }

    // Send confirmation email (non-blocking — don't fail registration if email fails)
    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "QDW 2026 <qdw2026@qdc-qcsa.org>";
      const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL || "quantum.ucla@gmail.com";

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        if (isStudent) {
          // Student: pending review email
          await resend.emails.send({
            from: fromEmail,
            to: registrationData.email,
            replyTo: replyToEmail,
            subject: "We received your QDW 2026 registration — pending review",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">Registration Received!</h1>
                    <p style="margin: 10px 0 0; font-size: 16px;">Quantum Device Workshop 2026</p>
                  </div>

                  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0 0 20px;">Hi ${registrationData.firstName},</p>

                    <p style="margin: 0 0 20px;">
                      Thank you for registering for <strong>QDW 2026</strong>! We've received your application and your student ID is currently under review.
                    </p>

                    <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px;"><strong>Your Registration Details:</strong></p>
                      <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${registrationData.firstName} ${registrationData.lastName}</p>
                      <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${registrationData.email}</p>
                      <p style="margin: 5px 0;">🎓 <strong>Type:</strong> ${registrationData.registrationType === 'student_in_person' ? 'Student – In Person ($60)' : 'Student – Online ($30)'}</p>
                    </div>

                    <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 8px;"><strong>⏳ What happens next?</strong></p>
                      <ol style="margin: 0; padding-left: 20px;">
                        <li style="margin-bottom: 6px;">Our team will verify your student ID photo</li>
                        <li style="margin-bottom: 6px;">You'll receive an email with a payment link once approved</li>
                        <li style="margin-bottom: 6px;">Complete payment to secure your spot</li>
                      </ol>
                    </div>

                    <p style="margin: 20px 0;">
                      If you have any questions in the meantime, feel free to reply to this email.
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
        } else {
          // Non-student: proceed to payment email
          await resend.emails.send({
            from: fromEmail,
            to: registrationData.email,
            replyTo: replyToEmail,
            subject: "Almost there — complete your QDW 2026 registration",
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">One Step Away!</h1>
                    <p style="margin: 10px 0 0; font-size: 16px;">Quantum Device Workshop 2026</p>
                  </div>

                  <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                    <p style="margin: 0 0 20px;">Hi ${registrationData.firstName},</p>

                    <p style="margin: 0 0 20px;">
                      Thank you for signing up for <strong>QDW 2026</strong>! Your registration details have been saved. Please complete your payment to confirm your spot.
                    </p>

                    <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0 0 10px;"><strong>Your Registration Details:</strong></p>
                      <p style="margin: 5px 0;">📝 <strong>Name:</strong> ${registrationData.firstName} ${registrationData.lastName}</p>
                      <p style="margin: 5px 0;">📧 <strong>Email:</strong> ${registrationData.email}</p>
                      <p style="margin: 5px 0;">🏷️ <strong>Type:</strong> ${registrationData.registrationType === 'professional_in_person' ? 'Professional – In Person' : registrationData.registrationType === 'professional_online' ? 'Professional – Online' : registrationData.registrationType}</p>
                    </div>

                    <p style="margin: 20px 0;">
                      If you did not complete payment yet, you were redirected to the payment page. If you need to return to it, please contact us and we'll resend your payment link.
                    </p>

                    <p style="margin: 20px 0;">
                      If you have any questions, feel free to reply to this email.
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
        }

        console.log(`Confirmation email sent to ${registrationData.email}`);
      }
    } catch (emailError) {
      // Don't fail the registration if email fails
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Registration saved successfully",
      id,
    });
  } catch (error) {
    console.error("Error saving registration:", error);
    return NextResponse.json(
      { error: "Failed to save registration. Please try again." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve registrations (admin use)
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    const adminKey = process.env.ADMIN_API_KEY;

    // Simple auth check
    const authHeader = request.headers.get("Authorization");
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const url = new URL(request.url);
    const qdcOnly = url.searchParams.get("qdc_members") === "true";

    let endpoint = `${supabaseUrl}/rest/v1/qdw_registrations?select=*&order=created_at.desc`;
    if (qdcOnly) {
      endpoint += "&wants_qdc_membership=eq.true";
    }

    const response = await fetch(endpoint, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Supabase fetch error:", errorText);
      return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ registrations: data });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}