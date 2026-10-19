import Link from "next/link";
import { Briefcase, ExternalLink } from "lucide-react";

import type { BlogUser } from "@/lib/blog/auth";
import { SignOutButton } from "@/app/careers/admin/sign-out-button";

type Tab = "posts" | "comments" | "categories" | "writers" | "profile";

const TABS: { id: Tab; label: string; href: string; adminOnly?: boolean }[] = [
  { id: "posts", label: "Posts", href: "/blog/admin" },
  { id: "comments", label: "Comments", href: "/blog/admin/comments", adminOnly: true },
  { id: "categories", label: "Categories", href: "/blog/admin/categories", adminOnly: true },
  { id: "writers", label: "Writers", href: "/blog/admin/writers", adminOnly: true },
  { id: "profile", label: "My profile", href: "/blog/admin/profile" },
];

/** Dashboard chrome shared by every /blog/admin page. */
export function BlogAdminShell({
  user,
  active,
  children,
}: {
  user: BlogUser;
  active: Tab | null;
  children: React.ReactNode;
}) {
  const tabs = TABS.filter((t) => !t.adminOnly || user.role === "admin");
  return (
    <main className="blog-admin" style={{ backgroundColor: "#000000", minHeight: "100vh" }}>
      <header className="border-b border-white/10 bg-black px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Blog <span style={{ color: "#0dcaf0" }}>Dashboard</span>
            </h1>
            <p className="mt-0.5 text-sm text-white/50">
              {user.author.name} · {user.role === "admin" ? "Admin" : "Writer"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/blog"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" /> View blog
            </Link>
            {user.role === "admin" && (
              <Link
                href="/careers/admin"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Briefcase className="h-4 w-4" /> Careers
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              className={`whitespace-nowrap border-b-2 px-3 pb-2.5 text-sm font-medium transition-colors ${
                active === t.id
                  ? "border-[#0dcaf0] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="w-full px-6 py-8 lg:px-10">{children}</div>
    </main>
  );
}

