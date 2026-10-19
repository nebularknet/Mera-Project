/**
 * Date helpers shared by the careers pages, the admin dashboard and emails.
 * Safe to import from both server and client code.
 *
 * Deadlines are calendar dates ("YYYY-MM-DD") interpreted in the company's
 * time zone: a role with last date 2026-11-05 accepts applications until the
 * end of 5 Nov in Pakistan time, wherever the server happens to run.
 */
export const CAREERS_TIME_ZONE = "Asia/Karachi";

/** Interviews can be scheduled at most this many days ahead. */
export const INTERVIEW_WINDOW_DAYS = 31;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(v: unknown): v is string {
  return typeof v === "string" && DATE_ONLY.test(v);
}

/** Today's calendar date in the careers time zone, as "YYYY-MM-DD". */
export function todayDateKey(now: Date = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CAREERS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** True once the last date has fully passed. No last date = never expires. */
export function isPastLastDate(lastDate: string | null | undefined, now: Date = new Date()) {
  return isDateOnly(lastDate) && lastDate < todayDateKey(now);
}

/** "2026-11-05" → "Nov 5, 2026" (no time-zone drift: it's a calendar date). */
export function formatDateOnly(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Interview timestamp in the careers time zone, e.g. "Mon, Nov 10, 2026, 3:00 PM (PKT)". */
export function formatInterview(iso: string) {
  const text = new Date(iso).toLocaleString("en-US", {
    timeZone: CAREERS_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${text} (PKT)`;
}
