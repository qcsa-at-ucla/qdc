import { Resend } from "resend";

type Status = "confirmed" | "waitlisted";

const NAVY = "#002F7B";
const REPLY_TO = "innovate@gobiz.ca.gov";

const DAY_LABELS: Record<string, string> = {
  day1: "Day 1 — October 22, 2026",
  day2: "Day 2 — October 23, 2026",
  both: "Both days — October 22–23, 2026",
  other: "Other (see your note)",
};

function shell(heading: string, subheading: string, inner: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: ${NAVY}; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">${heading}</h1>
          <p style="margin: 10px 0 0; font-size: 16px;">${subheading}</p>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          ${inner}
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p style="margin: 0;">This is an automated email from Quantum California</p>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} Quantum California. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
}

export async function sendRsvpEmail(params: {
  status: Status;
  fullName: string;
  email: string;
  attendance: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    console.warn("Resend not configured — skipping Quantum California RSVP email");
    return;
  }

  const { status, fullName, email, attendance } = params;
  const firstName = fullName.split(" ")[0] || fullName;
  const dayLabel = DAY_LABELS[attendance] || attendance;

  const subject =
    status === "confirmed"
      ? "You're registered for Quantum California"
      : "You're on the waitlist for Quantum California";

  const inner =
    status === "confirmed"
      ? `
        <p style="margin: 0 0 20px;">Hi ${firstName},</p>
        <p style="margin: 0 0 20px;">
          Your RSVP for <strong>Quantum California</strong> is confirmed. We're glad you'll be joining us.
        </p>
        <div style="background: white; border-left: 4px solid ${NAVY}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px;"><strong>Your RSVP</strong></p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Attending:</strong> ${dayLabel}</p>
        </div>
        <p style="margin: 20px 0;">
          Closer to the event we'll send a "know before you go" email with the detailed agenda,
          parking, and logistics.
        </p>
        <p style="margin: 0;">See you in October,<br><strong>The Quantum California Team</strong></p>
      `
      : `
        <p style="margin: 0 0 20px;">Hi ${firstName},</p>
        <p style="margin: 0 0 20px;">
          Thanks for your interest in <strong>Quantum California</strong>. We've reached our venue
          capacity, so you've been added to the <strong>waitlist</strong>.
        </p>
        <div style="background: white; border-left: 4px solid ${NAVY}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px;"><strong>Your RSVP</strong></p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Requested:</strong> ${dayLabel}</p>
        </div>
        <p style="margin: 20px 0;">
          We'll email you right away if a spot opens up. No action is needed from you.
        </p>
        <p style="margin: 0;">Thank you,<br><strong>The Quantum California Team</strong></p>
      `;

  const heading = status === "confirmed" ? "You're registered!" : "You're on the waitlist";

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html: shell(heading, "Quantum California · October 22–23, 2026", inner),
    });
    console.log(`✅ QC ${status} email sent to ${email}`);
  } catch (err) {
    // Non-fatal: the RSVP row is already committed and must not be lost
    // because the mail provider had a bad day.
    console.error("Failed to send Quantum California RSVP email:", err);
  }
}
