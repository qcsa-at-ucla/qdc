import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !serviceKey || !resendApiKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendApiKey);

    // Check if user exists and has paid
    const { data: user, error } = await supabase
      .from("qdw_registrations")
      .select("id, email, first_name, last_name")
      .eq("email", email.toLowerCase())
      .eq("payment_status", "paid")
      .single();

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (!error && user) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");
      
      // Token expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store the reset token
      const { error: tokenError } = await supabase
        .from("password_reset_tokens")
        .insert({
          user_id: user.id,
          email: user.email,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      if (tokenError) {
        console.error("Failed to store reset token:", tokenError);
        // Still return success to user
      } else {
        // Send password reset email
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/qdw/2026/reset-password?token=${resetToken}`;
        
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "QDW <onboarding@resend.dev>",
            to: user.email,
            subject: "Reset Your QDW 2026 Password",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Password Reset Request</h2>
                <p>Hi ${user.first_name},</p>
                <p>We received a request to reset your password for your QDW 2026 member account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="margin: 30px 0;">
                  <a href="${resetUrl}" 
                     style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
                <p style="margin-top: 30px; color: #666; font-size: 14px;">
                  This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                </p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">
                  QDW 2026 - Quantum Design Workshop<br>
                  UCLA
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send reset email:", emailError);
          // Still return success to user to prevent email enumeration
        }
      }
    }

    // Always return success (security best practice)
    return NextResponse.json(
      { 
        success: true, 
        message: "If an account exists with that email, a password reset link has been sent." 
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
