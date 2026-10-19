import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const constructPath = ({
  basePath,
  page,
  params,
}: {
  basePath: string;
  page: number;
  params: Record<string, string | undefined>;
}) => {
  const searchParams = new URLSearchParams();
  if (page > 1) searchParams.append("page", String(page));
  for (const [k, v] of Object.entries(params)) if (v) searchParams.append(k, v);
  const qs = searchParams.toString();
  return qs ? `${basePath}?${qs}` : basePath;
};

export const PostPagination = ({
  pagination,
  basePath = "/blog",
  query,
  tag,
  numSiblingPages = 2,
  className,
}: {
  className?: string;
  basePath?: string;
  query?: string;
  tag?: string;
  numSiblingPages?: number;
  pagination: {
    page: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
  };
}) => {
  if (pagination.totalPages <= 1) return null;
  const buildPath = (page: number) => constructPath({ basePath, page, params: { query, tag } });
  return (
    <Pagination className={cn("overflow-x-auto", className)}>
      <PaginationContent>
        {pagination.prevPage && (
          <PaginationItem>
            <PaginationPrevious href={buildPath(pagination.prevPage)} />
          </PaginationItem>
        )}
        {pagination.page > numSiblingPages + 1 && (
          <>
            <PaginationItem>
              <PaginationLink href={buildPath(1)}>1</PaginationLink>
            </PaginationItem>
            {pagination.page > numSiblingPages + 2 && <PaginationEllipsis />}
          </>
        )}
        {Array.from({ length: pagination.totalPages }, (_, index) => index + 1)
          .filter((pageNumber) => Math.abs(pagination.page - pageNumber) <= numSiblingPages)
          .map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink href={buildPath(pageNumber)} isActive={pageNumber === pagination.page}>
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
        {pagination.page < pagination.totalPages - numSiblingPages && (
          <>
            {pagination.page < pagination.totalPages - numSiblingPages - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink href={buildPath(pagination.totalPages)}>{pagination.totalPages}</PaginationLink>
            </PaginationItem>
          </>
        )}
        {pagination.nextPage && (
          <PaginationItem>
            <PaginationNext href={buildPath(pagination.nextPage)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
