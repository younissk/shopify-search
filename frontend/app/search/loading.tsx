import { PageContainer } from "@/components/layout/PageContainer";
import { Loader2 } from "lucide-react";

export default function SearchLoading() {
  return (
    <PageContainer className="space-y-8">
      {/* Search Bar Skeleton */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Results Count Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="border rounded-lg overflow-hidden bg-white shadow-sm"
          >
            {/* Image Skeleton */}
            <div className="aspect-square bg-gray-200 animate-pulse" />
            
            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse mt-4" />
            </div>
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

