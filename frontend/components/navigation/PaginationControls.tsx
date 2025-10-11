import Link from "next/link";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  makeHref: (page: number) => string;
  className?: string;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
}

export function PaginationControls({
  currentPage,
  totalPages,
  hasNextPage,
  makeHref,
  className,
  previousLabel = "← Previous",
  nextLabel = "Next →",
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-12 flex flex-wrap items-center justify-center gap-4  px-6 py-4 shadow-sm",
        className
      )}
    >
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="lg">
          <Link href={makeHref(currentPage - 1)}>{previousLabel}</Link>
        </Button>
      ) : null}

      <div className="inline-flex items-center gap-3 rounded-full border border-primary px-5 py-2 text-sm font-medium text-[var(--color-foreground-soft)] shadow-sm">
        <span>Page</span>
        <span className="rounded-full bg-primary px-3 py-1 text-secondary shadow-sm">
          {currentPage}
        </span>
        <span>of</span>
        <span className="font-semibold text-foreground">{totalPages}</span>
      </div>

      {hasNextPage ? (
        <Button asChild variant="outline" size="lg">
          <Link href={makeHref(currentPage + 1)}>{nextLabel}</Link>
        </Button>
      ) : null}
    </nav>
  );
}
