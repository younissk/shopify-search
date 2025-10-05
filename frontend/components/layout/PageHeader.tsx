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
  default: "rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-7 shadow-sm",
  muted: "rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-6",
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
      <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-4">
          {eyebrow ? <span className="pill-badge tracking-[0.18em]">{eyebrow}</span> : null}
          <div className="space-y-3">
            <h1 className="break-words text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
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
