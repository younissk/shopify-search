import { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  inset?: boolean;
}

/**
 * Provides the shared outer shell for application pages so spacing and
 * background treatments stay consistent as the theme evolves.
 */
export function PageContainer({
  as: Component = "section",
  className,
  children,
  inset = false,
}: PageContainerProps) {
  return (
    <Component
      className={cn(
        "w-full",
        inset &&
          "relative overflow-hidden rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white p-6 shadow-[var(--shadow-medium)]",
        className
      )}
    >
      {children}
    </Component>
  );
}
