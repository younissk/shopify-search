import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
  tone?: "default" | "muted";
}

const toneStyles: Record<NonNullable<PageHeaderProps["tone"]>, string> = {
  default: "glass-panel p-8",
  muted: "rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-8 py-6 shadow-sm",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
  tone = "default",
}: PageHeaderProps) {
  return (
    <header className={cn("relative overflow-hidden", toneStyles[tone], className)}>
      <div className="pointer-events-none absolute -right-40 -top-40 h-72 w-72 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.28),transparent_70%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.22),transparent_70%)]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? <span className="pill-badge tracking-[0.18em]">{eyebrow}</span> : null}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="text-base text-[var(--color-foreground-soft)] sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {meta}
          {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
