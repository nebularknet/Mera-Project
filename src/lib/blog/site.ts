import { config } from "@/config";

/** Site-level blog settings (titles, base URL for share links and feeds). */
export const BLOG = {
  title: "Nebulark Blog",
  description: "Ideas, insights and updates on design, development and technology from the Nebulark team.",
  baseUrl: (config.main.url || "https://nebulark.net").replace(/\/+$/, ""),
};

export function postUrl(slug: string) {
  return `${BLOG.baseUrl}/post/${slug}`;
}
