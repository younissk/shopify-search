import Image from "next/image";
import Link from "next/link";

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

  return typeof value === "string" && value.length > 0
    ? value
    : "Price unavailable";
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
  const fallbackImage = "/Placeholder.png";
  const productHref = `domains/${domain}/products/${id}`;
  const displayDomain = shortenDomain(domain, 26);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 ",
        className
      )}
      data-testid={`product-card-${id}`}
    >
      <Link
        href={productHref}
        className="relative block aspect-[3/2.7] min-h-[285px] max-h-[340px] overflow-hidden mb-2 bg-[var(--primary)] rounded-t-sm"
      >
        <Image
          src={image || fallbackImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] rounded-t-sm"
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 100vw"
          priority={false}
        />

        {/* Domain overlay - bottom left */}
        <span
          className="absolute bottom-0 left-0 bg-[var(--primary)] border-2 border-dashed border-[var(--background)] px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm transition-opacity hover:bg-black/80"
          title={domain}
        >
          {displayDomain}
        </span>

        {/* Price overlay - top right */}
        <span className="absolute top-0 right-0 bg-[var(--primary)] border-2 border-dashed border-[var(--background)] px-2 py-1 text-sm font-semibold text-white backdrop-blur-sm">
          {formattedPrice}
        </span>
      </Link>
      
      <div className="">
        <Link
          href={productHref}
          className="text-left text-base font-semibold leading-snug text-secondary transition-colors hover:text-primary"
        >
          <h3 className="line-clamp-2">{title}</h3>
        </Link>
      </div>
    </article>
  );
}
