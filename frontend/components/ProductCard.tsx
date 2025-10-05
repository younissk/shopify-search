import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn, shortenDomain } from "@/lib/utils";

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
  const fallbackImage = "https://placehold.co/600x400/ffffff/e2e8f0?text=No+Image";
  const productHref = `/domain/${domain}/product/${id}`;
  const storeHref = `/domain/${domain}`;
  const displayDomain = shortenDomain(domain, 26);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md",
        className
      )}
      data-testid={`product-card-${id}`}
    >
      <Link
        href={productHref}
        className="relative block aspect-[4/3] overflow-hidden bg-[rgba(226,232,240,0.4)]"
      >
        <Image
          src={image || fallbackImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 100vw"
          priority={false}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href={storeHref}
            className="max-w-full truncate text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]"
            title={domain}
          >
            {displayDomain}
          </Link>
          <span className="text-base font-semibold text-secondary">{formattedPrice}</span>
        </div>

        <Link
          href={productHref}
          className="text-left text-base font-semibold leading-snug text-secondary transition-colors hover:text-primary"
        >
          <h3 className="line-clamp-2">{title}</h3>
        </Link>

        <div className="mt-auto flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={productHref}
            className="inline-flex items-center gap-1 rounded-full border border-[rgba(15,23,42,0.14)] px-3 py-1 text-[var(--color-foreground-soft)] transition hover:border-primary/50 hover:text-primary"
            aria-label={`View details for ${title}`}
          >
            View details
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href={storeHref}
            className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-primary/90"
          >
            More from store
          </Link>
        </div>
      </div>
    </article>
  );
}
