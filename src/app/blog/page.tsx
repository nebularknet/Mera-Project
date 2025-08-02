import { BlogPostList } from "@/components/BlogPostList";
import { PostPagination } from "@/components/PostPagination";
import { getOgImageUrl } from "@/lib/ogImage";
import { wisp } from "@/lib/wisp";
import { Metadata } from "next";
import { FilterBar } from "../../components/FilterBar";
import { FullWidthHeader } from "../../components/FullWidthHeader";
import { config } from "../../config";

const { title, description } = config;

export const metadata: Metadata = {
  title: `${title} - Blog`,
  description,
  openGraph: {
    title: `${title} - Blog`,
    description,
    images: [getOgImageUrl(title)],
  },
};

export default async function BlogPage(
  props: {
    searchParams?: Promise<{ query: string; page: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;
  const result = await wisp.getPosts({
    limit: 6,
    query: searchParams?.query,
    page,
  });

  return (
    <div className="pt-20 blog-page">
      <FullWidthHeader title={title} description={description} />
      <div className="container mx-auto max-w-6xl">
        <FilterBar active="latest" className="my-8 blog-filter" />
        <BlogPostList posts={result.posts} />
        <PostPagination
          pagination={result.pagination}
          className="my-16 blog-pagination"
          query={searchParams?.query}
        />
      </div>
    </div>
  );
} 