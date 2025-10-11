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
          "relative overflow-hidden",
        className
      )}
    >
      {children}
    </Component>
  );
}
