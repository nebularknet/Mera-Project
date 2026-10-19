export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";

import { getAllPublishedForFeeds, getCategories } from "@/lib/blog/queries";
import { BLOG, postUrl } from "@/lib/blog/site";
import { getAllJobs } from "@/lib/jobs/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BLOG.baseUrl;
  const [posts, categories, jobs] = await Promise.all([
    getAllPublishedForFeeds(),
    getCategories(),
    getAllJobs().catch(() => []),
  ]);

  const pages = ["", "/studio", "/academy", "/services", "/blog", "/category", "/careers"];

  return [
    ...pages.map((p) => ({
      url: `${base}${p}`,
      lastModified: new Date(),
      priority: p === "" ? 1 : 0.7,
    })),
    ...posts.map((post) => ({
      url: postUrl(post.slug),
      lastModified: new Date(post.updated_at),
      priority: 0.8,
    })),
    ...categories
      .filter((c) => c.postCount > 0)
      .map((c) => ({
        url: `${base}/category/${c.slug}`,
        lastModified: new Date(),
        priority: 0.5,
      })),
    ...jobs
      .filter((j) => j.status === "Open")
      .map((j) => ({
        url: `${base}/careers/${j.id}`,
        lastModified: new Date(j.updated_at),
        priority: 0.6,
      })),
  ];
}
