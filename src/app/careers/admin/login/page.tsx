import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminEmail } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in — Nebulark Careers",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Already signed in and authorized → skip the form.
  if (await getAdminEmail()) redirect("/careers/admin");

  return (
    <main
      style={{ backgroundColor: "#000000", minHeight: "100vh" }}
      className="flex items-center justify-center px-4 py-24"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">
            Careers <span style={{ color: "#0dcaf0" }}>Admin</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Sign in to review applications.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
