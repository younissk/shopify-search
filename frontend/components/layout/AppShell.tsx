"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { AppBar } from "./AppBar";
import { Footer } from "./Footer";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <div className={cn("min-h-screen bg-[var(--gradient-page)] text-foreground flex flex-col", className)}>
      {!isHomePage && <AppBar />}
      <main className={cn(
        "flex-1 mx-auto w-full px-4 pb-16",
        isHomePage ? "pt-0" : "max-w-6xl pt-6 sm:pt-8"
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
