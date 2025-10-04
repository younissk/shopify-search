import Link from "next/link";
import { Check } from "lucide-react";

interface ProductMetaBarProps {
  updatedAt?: string;
  domain: string;
}

export function ProductMetaBar({ updatedAt, domain }: ProductMetaBarProps) {
  if (!updatedAt) {
    return null;
  }

  const formattedDate = new Date(updatedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mt-12 flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-4 text-sm text-[var(--color-foreground-soft)] shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Check className="h-4 w-4" />
        </span>
        <span>
          Updated on
          <span className="ml-2 font-semibold text-foreground">{formattedDate}</span>
        </span>
      </div>
      <Link
        href={`/domain/${domain}`}
        className="inline-flex items-center rounded-full border border-[rgba(15,23,42,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] transition hover:border-primary/40 hover:text-primary"
      >
        View more from this store
      </Link>
    </div>
  );
}
