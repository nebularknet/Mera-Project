import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Server-side cleanup of editor output. The editor sends HTML generated from
 * its document, but anything from the browser is untrusted: this allow-list is
 * what makes it safe to render with dangerouslySetInnerHTML on public pages.
 */
const YOUTUBE_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "youtube.com"];

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr",
      "strong", "b", "em", "i", "u", "s", "code", "pre", "mark",
      "blockquote", "ul", "ol", "li",
      "a", "img", "div", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder"],
      div: ["data-youtube-video"],
      code: ["class"],
      pre: ["class"],
      ol: ["start"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https", "http"] },
    allowedIframeHostnames: YOUTUBE_HOSTS,
    allowProtocolRelative: false,
    transformTags: {
      // The post title is the page's only <h1>.
      h1: "h2",
      a: (tagName, attribs) => {
        const { target: _t, rel: _r, ...rest } = attribs;
        const external = /^https?:\/\//i.test(rest.href ?? "");
        return {
          tagName,
          attribs: external
            ? { ...rest, target: "_blank", rel: "noopener noreferrer nofollow" }
            : rest,
        };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
    // Drop iframes whose src was removed (not YouTube).
    exclusiveFilter: (frame) => frame.tag === "iframe" && !frame.attribs.src,
  });
}

/** Plain text of the post body, for search and reading time. */
export function htmlToText(html: string): string {
  // Keep words in separate blocks apart ("…world</p><p>again" → "world again").
  const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote|pre|div)>|<br\s*\/?>/gi, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** ~200 words per minute, at least 1. */
export function readingMinutes(text: string): number {
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return Math.max(1, Math.round(words / 200));
}

/** "Hello, World!" → "hello-world" (ASCII, max 80 chars). */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Tags: trimmed, lower-case, deduplicated, max 10 of 30 chars each. */
export function normalizeTags(raw: string): string[] {
  const tags = raw
    .split(",")
    .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
    .filter((t) => t.length > 0 && t.length <= 30);
  return Array.from(new Set(tags)).slice(0, 10);
}
