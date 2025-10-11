import Image from "next/image";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative aspect-square w-full max-w-screen overflow-hidden  sm:max-w-none">
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
        
        {/* Fullscreen button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-0 right-0 flex h-10 w-10 items-center justify-center rounded-xs bg-[var(--primary)] backdrop-blur-sm text-white transition-all hover:bg-black/70 hover:scale-105 border-2 border-dashed border-[var(--background)]"
          aria-label="View image in fullscreen"
        >
          <Maximize2 className="h-5 w-5" />
        </button>
      
      {images.length > 1 ? (
        <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={image.image_id ?? `${image.src}-${index}`}
                type="button"
                onClick={() => onSelect(index)}
                className={cn(
                  "group relative h-16 w-16 flex-shrink-0 overflow-hidden border-2 border-dashed border-[var(--background)] transition-all hover:bg-white/20",
                  isActive && "border-white ring-2 ring-white/50"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 rounded-lg bg-white/20 opacity-0 transition-opacity group-hover:opacity-100",
                    isActive && "opacity-60"
                  )}
                />
                <Image
                  src={image.src}
                  alt={image.alt || title}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <Image
              src={activeImage?.src || fallbackImage}
              alt={activeImage?.alt || title}
              width={1200}
              height={1200}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              priority
            />
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white transition-all hover:bg-black/70 hover:scale-105"
              aria-label="Close fullscreen"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
