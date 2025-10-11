import Image from "next/image";

import { cn } from "@/lib/utils";

interface GalleryImage {
  image_id?: number | string;
  src: string;
  alt?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  currentIndex: number;
  onSelect: (index: number) => void;
  title: string;
}

const fallbackImage = "/Placeholder.png";

export function ProductGallery({
  images,
  currentIndex,
  onSelect,
  title,
}: ProductGalleryProps) {
  const activeImage = images[currentIndex];

  return (
    <div className="space-y-6">
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-[rgba(226,232,240,0.4)] shadow-[var(--shadow-medium)]">
        <Image
          src={activeImage?.src || fallbackImage}
          alt={activeImage?.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 32rem, 100vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={image.image_id ?? `${image.src}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[var(--radius)] border border-[rgba(15,23,42,0.08)] bg-white transition",
                  isActive && "ring-2 ring-primary/60"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-[var(--radius)] bg-gradient-to-br from-white/40 via-transparent to-white/10 opacity-0 transition-opacity group-hover:opacity-60",
                    isActive && "opacity-90"
                  )}
                />
                <Image
                  src={image.src}
                  alt={image.alt || title}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
