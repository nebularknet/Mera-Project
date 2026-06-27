import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.CAREERS_FROM_EMAIL || "onboarding@resend.dev";
const NOTIFY = process.env.CAREERS_NOTIFY_EMAIL;

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Thin wrapper around Resend. Never throws into the request path — a failed
 * email must not fail an application submission or a status update. Errors are
 * logged and swallowed; the caller decides whether email delivery is critical.
 */
async function sendEmail({ to, subject, html }: SendArgs) {
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[resend] send failed:", error);
      return { ok: false as const, error };
    }
    return { ok: true as const };
  } catch (err) {
    console.error("[resend] send threw:", err);
    return { ok: false as const, error: err };
  }
}

/** Sent to the applicant immediately after they submit. */
export function emailApplicationReceived(to: string, name: string, role: string) {
  return sendEmail({
    to,
    subject: `We received your application — ${role}`,
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Thanks for applying for the <strong>${escapeHtml(role)}</strong> role at Nebulark.
         We've received your application and our team will review it shortly.</p>
      <p>We'll be in touch by email with any updates.</p>
      <p>— The Nebulark Team</p>
    `,
  });
}

/** Sent to the shared team inbox when a new application lands. */
export function emailTeamNewApplication(name: string, role: string, email: string) {
  if (!NOTIFY) return Promise.resolve({ ok: false as const, error: "no notify address" });
  return sendEmail({
    to: NOTIFY,
    subject: `New application: ${role} — ${name}`,
    html: `
      <p>A new application has been submitted.</p>
      <ul>
        <li><strong>Role:</strong> ${escapeHtml(role)}</li>
        <li><strong>Name:</strong> ${escapeHtml(name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
      </ul>
      <p>Review it in the dashboard.</p>
    `,
  });
}

/** Sent to the applicant when a reviewer changes their status. */
export function emailStatusChanged(to: string, name: string, role: string, status: string) {
  const friendly =
    status === "shortlisted"
      ? "Good news — you've been shortlisted! Our team will reach out about next steps."
      : status === "rejected"
        ? "After careful review, we've decided not to move forward at this time. We genuinely appreciate your interest and wish you the best."
        : `Your application status has been updated to: ${status}.`;

  return sendEmail({
    to,
    subject: `Update on your application — ${role}`,
    html: `
      <p>Hi ${escapeHtml(name)},</p>
      <p>${friendly}</p>
      <p>— The Nebulark Team</p>
    `,
  });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
