import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAdminEmail } from "@/lib/auth/session";
import { getBlogUser } from "@/lib/blog/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — Nebulark Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ next?: string }>;

export default async function AdminLoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  const toBlog = next?.startsWith("/blog/admin");

  // Already signed in and authorized → skip the form.
  if (await getAdminEmail()) redirect(toBlog ? "/blog/admin" : "/careers/admin");
  // Signed-in writers only have the blog dashboard.
  const blogUser = await getBlogUser().catch(() => null);
  if (blogUser) redirect("/blog/admin");

  return (
    <main
      style={{ backgroundColor: "#000000", minHeight: "100vh" }}
      className="flex items-center justify-center px-4 py-24"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-white">
            {toBlog ? "Blog" : "Careers"} <span style={{ color: "#0dcaf0" }}>Admin</span>
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {toBlog ? "Sign in to write and manage posts." : "Sign in to review applications."}
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
