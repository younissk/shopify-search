import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-white text-foreground", className)}>
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:pt-12">
        {children}
      </main>
    </div>
  );
}
