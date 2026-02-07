import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

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

    // Check if user exists and has paid
    const { data: user, error } = await supabase
      .from("qdw_registrations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("payment_status", "paid")
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid credentials or payment not found" },
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
          project_title: user.project_title,
          project_description: user.project_description,
          poster_url: user.poster_url,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
