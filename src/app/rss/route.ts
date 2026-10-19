export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import RSS from "rss";

import { getAllPublishedForFeeds } from "@/lib/blog/queries";
import { BLOG, postUrl } from "@/lib/blog/site";

export async function GET() {
  const posts = await getAllPublishedForFeeds(20);

  const feed = new RSS({
    title: BLOG.title,
    description: BLOG.description,
    site_url: `${BLOG.baseUrl}/blog`,
    feed_url: `${BLOG.baseUrl}/rss`,
    pubDate: posts[0]?.published_at ? new Date(posts[0].published_at) : new Date(),
  });
  for (const post of posts) {
    feed.item({
      title: post.title,
      description: post.excerpt ?? "",
      url: postUrl(post.slug),
      date: post.published_at ? new Date(post.published_at) : new Date(post.updated_at),
    });
  }

  return new NextResponse(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/rss+xml",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
