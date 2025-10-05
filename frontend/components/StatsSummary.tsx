import { cn } from "@/lib/utils";
import type { CatalogueStatistics } from "@/supabase/stats";

interface StatsSummaryProps {
  stats: CatalogueStatistics;
  className?: string;
}

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);

const formatDate = (value: string | null): string => {
  if (!value) {
    return "No sync yet";
  }

  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return value;
  }
};

export function StatsSummary({ stats, className }: StatsSummaryProps) {
  const items = [
    {
      label: "Products indexed",
      value: formatNumber(stats.totalProducts),
      helper: `Last sync ${formatDate(stats.latestFetchedAt)}`,
    },
    {
      label: "Active stores",
      value: formatNumber(stats.uniqueDomains),
      helper: "Unique domains tracked",
    },
    {
      label: "Images stored",
      value: formatNumber(stats.totalImages),
      helper: stats.latestUpdatedAt ? `Updated ${formatDate(stats.latestUpdatedAt)}` : "Metadata in sync",
    },
  ];

  return (
    <section className={cn("grid gap-4 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
            {item.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-secondary sm:text-3xl">
            {item.value}
          </p>
          <p className="mt-2 text-xs text-[var(--color-foreground-soft)]">{item.helper}</p>
        </div>
      ))}
    </section>
  );
}
