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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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

// "promoted" is a waitlisted RSVP moved to confirmed by an admin: same
// registered email, with an intro that acknowledges the earlier waitlist notice.
type EmailKind = Status | "promoted";

const SUBHEADING = "Quantum California · October 22–23, 2026";

function buildEmail(params: {
  kind: EmailKind;
  fullName: string;
  email: string;
  attendance: string;
}): { subject: string; html: string } {
  const { kind, fullName, email, attendance } = params;
  const firstName = fullName.split(" ")[0] || fullName;
  const dayLabel = DAY_LABELS[attendance] || attendance;
  const registered = kind !== "waitlisted";

  const subject = registered
    ? "You're registered for Quantum California"
    : "You're on the waitlist for Quantum California";

  const intro =
    kind === "promoted"
      ? `Good news: a spot has opened up, and you're now <strong>registered</strong> for
          <strong>Quantum California</strong>. Welcome! We're glad you'll be joining us.`
      : `Your RSVP for <strong>Quantum California</strong> is confirmed. We're glad you'll be joining us.`;

  const inner =
    registered
      ? `
        <p style="margin: 0 0 20px;">Hi ${escapeHtml(firstName)},</p>
        <p style="margin: 0 0 20px;">
          ${intro}
        </p>
        <div style="background: white; border-left: 4px solid ${NAVY}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px;"><strong>Your RSVP</strong></p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 5px 0;"><strong>Attending:</strong> ${dayLabel}</p>
        </div>
        <p style="margin: 20px 0;">
          Closer to the event we'll send a "know before you go" email with the detailed agenda,
          parking, and logistics.
        </p>
        <p style="margin: 0;">See you in October,<br><strong>The Quantum California Team</strong></p>
      `
      : `
        <p style="margin: 0 0 20px;">Hi ${escapeHtml(firstName)},</p>
        <p style="margin: 0 0 20px;">
          Thanks for your interest in <strong>Quantum California</strong>. We've reached our venue
          capacity, so you've been added to the <strong>waitlist</strong>.
        </p>
        <div style="background: white; border-left: 4px solid ${NAVY}; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0 0 10px;"><strong>Your RSVP</strong></p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin: 5px 0;"><strong>Requested:</strong> ${dayLabel}</p>
        </div>
        <p style="margin: 20px 0;">
          We'll email you right away if a spot opens up. No action is needed from you.
        </p>
        <p style="margin: 0;">Thank you,<br><strong>The Quantum California Team</strong></p>
      `;

  const heading = registered ? "You're registered!" : "You're on the waitlist";

  return { subject, html: shell(heading, SUBHEADING, inner) };
}

function resendConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_QC_FROM_EMAIL || "Quantum California <quantum-california@qdc-qcsa.org>";
  return apiKey && from ? { apiKey, from } : null;
}

export async function sendRsvpEmail(params: {
  status: Status;
  fullName: string;
  email: string;
  attendance: string;
}): Promise<void> {
  const config = resendConfig();
  if (!config) {
    console.warn("Resend not configured — skipping Quantum California RSVP email");
    return;
  }

  const { status, email } = params;
  const { subject, html } = buildEmail({ ...params, kind: status });

  try {
    const resend = new Resend(config.apiKey);
    await resend.emails.send({
      from: config.from,
      to: email,
      replyTo: REPLY_TO,
      subject,
      html,
    });
    console.log(`✅ QC ${status} email sent to ${email}`);
  } catch (err) {
    // Non-fatal: the RSVP row is already committed and must not be lost
    // because the mail provider had a bad day.
    console.error("Failed to send Quantum California RSVP email:", err);
  }
}

// Resend caps a batch at 100 messages and the account at ~2 requests/second.
const BATCH_SIZE = 100;
const BATCH_PAUSE_MS = 600;

// Sends the "you're registered" email to RSVPs promoted off the waitlist.
// Returns the addresses that did not go out so the admin can follow up by hand.
export async function sendPromotionEmails(
  rows: { full_name: string; email: string; attendance: string }[]
): Promise<{ sent: string[]; failed: string[] }> {
  const sent: string[] = [];
  const failed: string[] = [];

  const config = resendConfig();
  if (!config) {
    console.warn("Resend not configured — skipping Quantum California promotion emails");
    return { sent, failed: rows.map((r) => r.email) };
  }

  const resend = new Resend(config.apiKey);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    if (i > 0) await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));

    const chunk = rows.slice(i, i + BATCH_SIZE);
    const emails = chunk.map((r) => ({
      from: config.from,
      to: r.email,
      replyTo: REPLY_TO,
      ...buildEmail({ kind: "promoted", fullName: r.full_name, email: r.email, attendance: r.attendance }),
    }));
    const addresses = chunk.map((r) => r.email);

    try {
      // The SDK reports API failures in `error` rather than throwing.
      const { error } = await resend.batch.send(emails);
      if (error) {
        console.error("❌ QC promotion batch failed:", error);
        failed.push(...addresses);
      } else {
        console.log(`✅ QC promotion emails sent: ${addresses.length}`);
        sent.push(...addresses);
      }
    } catch (err) {
      console.error("❌ QC promotion batch threw:", err);
      failed.push(...addresses);
    }
  }

  return { sent, failed };
}
