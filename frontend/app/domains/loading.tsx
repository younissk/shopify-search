import { PageContainer } from "@/components/layout/PageContainer";
import { Loader2 } from "lucide-react";

export default function DomainsLoading() {
  return (
    <PageContainer className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Subheader Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Domains Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden bg-white shadow-sm p-6 space-y-4"
          >
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </PageContainer>
  );
}

