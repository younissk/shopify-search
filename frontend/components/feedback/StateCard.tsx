import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface StateCardProps {
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "danger" | "positive";
}

const toneStyles: Record<NonNullable<StateCardProps["tone"]>, string> = {
  neutral: "glass-panel",
  danger: "glass-panel border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.08)]",
  positive: "glass-panel border border-[rgba(52,211,153,0.35)] bg-[rgba(52,211,153,0.08)]",
};

const iconToneStyles: Record<NonNullable<StateCardProps["tone"]>, string> = {
  neutral: "text-primary",
  danger: "text-[var(--color-danger)]",
  positive: "text-[var(--color-success)]",
};

export function StateCard({
  title,
  description,
  icon,
  action,
  className,
  tone = "neutral",
}: StateCardProps) {
  return (
    <div
      className={cn(
        "relative flex max-w-xl flex-col items-center gap-4 px-10 py-12 text-center",
        toneStyles[tone],
        className
      )}
    >
      {icon ? <div className={iconToneStyles[tone]} aria-hidden>{icon}</div> : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-[var(--color-foreground-soft)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
