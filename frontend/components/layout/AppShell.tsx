import Link from "next/link";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
];

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn("relative flex min-h-screen flex-col", className)}>
      <header className="sticky top-0 z-50 border-b border-[rgba(15,23,42,0.05)] bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:py-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide text-secondary">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-base font-bold">S</span>
            </span>
            <span className="text-base font-semibold text-secondary sm:text-lg">Shopify Search</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-[var(--color-foreground-soft)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 transition hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {children}
      </main>

      <footer className="border-t border-[rgba(15,23,42,0.05)] bg-white/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[var(--color-foreground-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>Crafted for discovering products across Shopify stores.</p>
          <p className="font-medium text-secondary">Powered by Shopify Search</p>
        </div>
      </footer>
    </div>
  );
}
