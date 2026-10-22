import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getAdminEmail } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminsManager, type AdminRow } from "./admins-manager";

export const metadata: Metadata = {
  title: "Manage Admins — Nebulark Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ManageAdminsPage() {
  const me = await getAdminEmail();
  if (!me) redirect("/careers/admin/login");

  const db = createAdminClient();
  const { data } = await db.from("allowed_admins").select("email, created_at").order("created_at");

  // Last sign-in per admin, from Supabase Auth (best-effort).
  const lastSignIn = new Map<string, string | null>();
  const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  for (const u of users?.users ?? []) {
    if (u.email) lastSignIn.set(u.email.toLowerCase(), u.last_sign_in_at ?? null);
  }

  const rows: AdminRow[] = (data ?? []).map((a) => ({
    email: a.email as string,
    addedAt: a.created_at as string,
    lastSignInAt: lastSignIn.get((a.email as string).toLowerCase()) ?? null,
    hasLogin: lastSignIn.has((a.email as string).toLowerCase()),
    isMe: (a.email as string).toLowerCase() === me.toLowerCase(),
  }));

  return (
    <main style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur lg:px-10">
        <Link
          href="/careers/admin"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 no-underline hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to applications
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Manage <span style={{ color: "#0dcaf0" }}>Admins</span>
        </h1>
        <p className="mt-0.5 text-sm text-white/50">
          Admins can sign in to the careers dashboard, Manage Blog and the blog dashboard.
        </p>
      </header>

      <div className="w-full px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <AdminsManager rows={rows} />
        </div>
      </div>
    </main>
  );
}
