import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { apiKey, registrationId, subject, body } = await req.json();

    const adminApiKey = process.env.ADMIN_API_KEY;
    if (!adminApiKey || apiKey !== adminApiKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!registrationId || !subject || !body) {
      return NextResponse.json(
        { error: "registrationId, subject, and body are required" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const replyToEmail = process.env.RESEND_REPLY_TO_EMAIL;

    if (!supabaseUrl || !serviceKey || !resendApiKey || !fromEmail) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const resend = new Resend(resendApiKey);

    const { data: registration, error: fetchError } = await supabase
      .from("qdw_registrations")
      .select("email, first_name, last_name")
      .eq("id", registrationId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    const htmlBody = body
      .split("\n")
      .map((line: string) =>
        line.trim()
          ? `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#374151">${line}</p>`
          : `<p style="margin:0 0 16px 0">&nbsp;</p>`
      )
      .join("");

    await resend.emails.send({
      from: fromEmail,
      to: registration.email,
      replyTo: replyToEmail || fromEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 20px">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:36px 40px;border-radius:12px 12px 0 0;text-align:center">
                        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px">Quantum Device Workshop 2026</h1>
                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px">Quantum Computing Student Association, UCLA</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="background:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb">
                        ${htmlBody}
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9fafb;padding:24px 40px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;text-align:center">
                        <p style="margin:0;font-size:13px;color:#6b7280">This email was sent by the QDW 2026 organizing team.</p>
                        <p style="margin:6px 0 0;font-size:13px;color:#6b7280">
                          Quantum Device Workshop 2026 &mdash; Quantum Computing Student Association, UCLA
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
