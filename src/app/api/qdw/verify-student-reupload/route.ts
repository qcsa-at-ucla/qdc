import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

/**
 * Verify student credentials for ID reupload
 * This allows students with pending or rejected status to authenticate
 * (before payment) to update their student ID
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Check if user exists (student registration with pending or rejected status)
    const { data: user, error } = await supabase
      .from("qdw_registrations")
      .select("*")
      .eq("email", email.toLowerCase())
      .in("registration_type", ["student_in_person", "student_online"])
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please check your email and password." },
        { status: 401 }
      );
    }

    // Check if password is set
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "Account setup incomplete. Please contact support." },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user actually needs to reupload (pending or rejected)
    if (user.approval_status !== "pending" && user.approval_status !== "rejected") {
      if (user.payment_status === "paid") {
        return NextResponse.json(
          { error: "Your registration is already complete. Please visit the member-only page." },
          { status: 400 }
        );
      }
    }

    // Successful login
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          registration_type: user.registration_type,
          approval_status: user.approval_status,
          payment_status: user.payment_status,
          student_id_photo_url: user.student_id_photo_url,
          created_at: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Student reupload verification error:", err);
    return NextResponse.json(
      { error: "An error occurred during authentication" },
      { status: 500 }
    );
  }
}
