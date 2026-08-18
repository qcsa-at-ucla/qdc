export interface Rsvp {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  job_title: string | null;
  attendance: string;
  attendance_other: string | null;
  dietary_restrictions: string | null;
  accessibility_needs: string | null;
  media_consent: boolean;
  status: string;
  created_at: string;
}

const COLUMNS: { header: string; get: (r: Rsvp) => string }[] = [
  { header: "Full Name", get: (r) => r.full_name },
  { header: "Email", get: (r) => r.email },
  { header: "Organization", get: (r) => r.organization || "" },
  { header: "Job Title", get: (r) => r.job_title || "" },
  { header: "Attending", get: (r) => r.attendance },
  { header: "Attending (Other)", get: (r) => r.attendance_other || "" },
  { header: "Dietary Restrictions", get: (r) => r.dietary_restrictions || "" },
  { header: "Accessibility Needs", get: (r) => r.accessibility_needs || "" },
  { header: "Media Consent", get: (r) => (r.media_consent ? "Yes" : "No") },
  { header: "Status", get: (r) => r.status },
  { header: "Registered At", get: (r) => new Date(r.created_at).toLocaleString() },
];

/**
 * Neutralizes spreadsheet formula injection and applies RFC 4180 quoting.
 * Excel/Sheets treat a leading = + - @ (or tab/CR) as the start of a
 * formula, so such values are prefixed with an apostrophe to force them to
 * be read as literal text. Then, per RFC 4180, the value is wrapped in
 * quotes when it contains a comma, quote, or newline, with any inner
 * quotes doubled.
 */
function escapeCell(value: string): string {
  // Neutralize spreadsheet formula injection: Excel/Sheets treat a leading
  // = + - @ (or tab/CR) as the start of a formula. Prefixing with an
  // apostrophe forces the cell to be read as literal text.
  const v = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  // RFC 4180: quote when the value contains a comma, quote, or newline;
  // double any inner quotes.
  return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export function toCsv(rows: Rsvp[]): string {
  const header = COLUMNS.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((r) => COLUMNS.map((c) => escapeCell(c.get(r))).join(","));
  return "﻿" + [header, ...body].join("\r\n");
}
