"use client";

import * as React from "react";
import { Check, Link2 } from "lucide-react";
import { FaFacebookF, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = React.useState(false);
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const links = [
    { label: "Share on LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <FaLinkedinIn /> },
    { label: "Share on X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`, icon: <FaXTwitter /> },
    { label: "Share on Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <FaFacebookF /> },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  const btn =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:border-[#0dcaf0] hover:text-[#0dcaf0]";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="mr-1 text-sm font-medium text-white/60">Share this article</span>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label} className={btn}>
          {l.icon}
        </a>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" title="Copy link" className={btn}>
        {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
      {copied && <span className="text-xs text-[#0dcaf0]">Link copied</span>}
    </div>
  );
}
