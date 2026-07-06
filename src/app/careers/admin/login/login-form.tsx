"use client";

import * as React from "react";
import { LogIn } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "./actions";

const fieldCls =
  "border-white/10 bg-[#121212] text-white placeholder:text-white/40 focus-visible:ring-[#0dcaf0]/50";

export function LoginForm() {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await signIn(new FormData(e.currentTarget));
    // signIn redirects on success; we only get here on failure.
    if (res && !res.ok) setError(res.error);
    setPending(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-white">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@nebulark.com"
          className={fieldCls}
          required
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm text-white">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={fieldCls}
          required
        />
      </div>

      {error && <p className="text-sm font-medium text-red-400">{error}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[#0dcaf0] font-semibold text-black hover:bg-[#0dcaf0]/90"
      >
        <LogIn className="mr-2 h-4 w-4" />
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
