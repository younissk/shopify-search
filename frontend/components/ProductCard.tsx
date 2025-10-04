import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  price: string | number;
  domain: string;
  image?: string;
  id: string;
  className?: string;
}

function formatPrice(value: string | number): string {
  const numeric = Number.parseFloat(String(value));

  if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(numeric);
  }

  return typeof value === "string" && value.length > 0 ? value : "Price unavailable";
}

export default function ProductCard({
  title,
  price,
  domain,
  image,
  id,
  className,
}: ProductCardProps) {
  const formattedPrice = formatPrice(price);
  const fallbackImage = "https://placehold.co/600x400";
  const productHref = `/domain/${domain}/product/${id}`;
  const storeHref = `/domain/${domain}`;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl border border-[rgba(15,23,42,0.08)] bg-white shadow transition-shadow duration-300 hover:shadow-lg",
        className
      )}
      data-testid={`product-card-${id}`}
    >
      <Link
        href={productHref}
        className="relative block aspect-[4/3] overflow-hidden bg-[rgba(226,232,240,0.35)]"
      >
        <Image
          src={image || fallbackImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          priority={false}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
      </Link>
      <div className="flex flex-1 flex-col gap-4 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Featured
          </span>
          <span className="text-lg font-semibold text-secondary">{formattedPrice}</span>
        </div>
        <Link
          href={productHref}
          className="text-left text-base font-semibold leading-snug text-secondary transition-colors hover:text-primary"
        >
          <h3 className="line-clamp-2">{title}</h3>
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
          <Link
            href={storeHref}
            className="inline-flex items-center gap-1 rounded-full border border-[rgba(15,23,42,0.08)] px-3 py-1 transition hover:border-primary/40 hover:text-primary"
            aria-label={`Browse more products from ${domain}`}
          >
            {domain}
          </Link>
          <Link
            href={productHref}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-primary-foreground transition hover:bg-primary/90"
            aria-label={`View details for ${title}`}
          >
            View
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
