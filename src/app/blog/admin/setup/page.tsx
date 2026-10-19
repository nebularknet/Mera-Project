import type { Metadata } from "next";
import Link from "next/link";
import { Database } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog setup — Nebulark Admin",
  robots: { index: false, follow: false },
};

/** Shown when supabase/blog-schema.sql hasn't been run yet. */
export default function BlogSetupPage() {
  return (
    <main
      style={{ backgroundColor: "#000000", minHeight: "100vh" }}
      className="flex items-center justify-center px-4 py-24"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center">
        <Database className="mx-auto h-10 w-10 text-[#0dcaf0]" />
        <h1 className="mt-4 text-2xl font-semibold text-white">The blog database isn&apos;t set up yet</h1>
        <p className="mt-3 text-sm text-white/65">
          Open the Supabase dashboard → SQL Editor → New query, paste the contents of{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">supabase/blog-schema.sql</code>{" "}
          from the project, and run it. Then reload this page.
        </p>
        <Link href="/blog/admin" className="more-button mt-6 inline-block">
          Reload
        </Link>
      </div>
    </main>
  );
}
