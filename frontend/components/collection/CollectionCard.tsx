import Image from "next/image";
import Link from "next/link";
import { Gem, Globe, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface CollectionCardProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isPublic: boolean;
  itemCount: number;
  thumbnails?: string[];
  className?: string;
}

export function CollectionCard({
  id,
  name,
  slug,
  description,
  isPublic,
  itemCount,
  thumbnails = [],
  className,
}: CollectionCardProps) {
  const displayThumbnails = thumbnails.slice(0, 4);
  const remainingCount = Math.max(0, itemCount - displayThumbnails.length);

  return (
    <Link href={`/collections/${slug}`}>
      <article
        className={cn(
          "group flex h-full flex-col overflow-hidden rounded-lg border-2 transition-all",
          className
        )}
        data-testid={`collection-card-${id}`}
      >
        {/* Thumbnail grid */}
        <div className="relative aspect-square w-full border-2 border-dashed border-[var(--background)] bg-[var(--primary)]">
          {displayThumbnails.length > 0 ? (
            <div
              className={cn(
                "grid h-full w-full",
                displayThumbnails.length === 1 && "grid-cols-1",
                displayThumbnails.length === 2 && "grid-cols-2",
                displayThumbnails.length >= 3 && "grid-cols-2 grid-rows-2"
              )}
            >
              {displayThumbnails.map((thumbnail, index) => (
                <div key={index} className="relative ">
                  <Image
                    src={thumbnail || "/Placeholder.png"}
                    alt={`${name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  />
                </div>
              ))}
              {remainingCount > 0 && displayThumbnails.length < 4 && (
                <div className="relative flex items-center justify-center ">
                  <span className="text-2xl font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center flex flex-col items-center justify-center">
                <Gem />
                <p className="mt-2 text-sm ">Empty collection</p>
              </div>
            </div>
          )}

          {/* Visibility badge */}
          <div className="absolute top-2 right-2">
            <Badge
              variant={isPublic ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isPublic ? (
                <>
                  <Globe className="h-3 w-3" />
                  <span className="text-xs">Public</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  <span className="text-xs">Private</span>
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Collection info */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="text-lg font-semibold  line-clamp-1 group-hover:text-primary transition-colors">
            {name}
          </h3>

          {description && (
            <p className="mt-1 text-sm  line-clamp-2">
              {description}
            </p>
          )}

          <div className="mt-auto pt-3">
            <p className="text-sm text-gray-500">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </article>
    </Link>
  );
}
