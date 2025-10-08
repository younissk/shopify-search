import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { AppBar } from "./AppBar";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-[var(--gradient-page)] text-foreground", className)}>
      <AppBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:pt-8">
        {children}
      </main>
    </div>
  );
}
