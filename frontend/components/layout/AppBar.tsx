"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  Gem,
} from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

interface AppBarProps {
  className?: string;
}

const navigation = [
  { name: "Domains", href: "/domains", icon: Settings },
];

const authNavigation = [
  { name: "Collections", href: "/collections", icon: Gem },
];

export function AppBar({ className }: AppBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b-4 border-dashed border-[var(--border)] bg-[#824026]",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo/Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-secondary transition-colors hover:text-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Shopify Search Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:block">Shopify Search</span>
            </Link>
          </div>

          {/* Search Bar - Always visible and prominent */}
          <div className="flex-1 max-w-xl mx-6">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products, brands, stores..."
              className="w-full"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-1 flex-shrink-0">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)] hover:text-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Auth-only navigation */}
            <SignedIn>
              {authNavigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary shadow-sm"
                        : "text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)] hover:text-secondary"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </SignedIn>
            
            {/* Authentication */}
            <div className="ml-4 flex items-center space-x-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 bopx-2 py-4 backdrop-blur-sm">
              {/* Mobile Navigation Links */}
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)] hover:text-secondary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth-only navigation */}
              <SignedIn>
                {authNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-[var(--color-foreground-soft)] hover:bg-[var(--color-overlay)] hover:text-secondary"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </SignedIn>
              
              {/* Mobile Authentication */}
              <div className="border-t border-[var(--border)] pt-4 mt-4">
                <SignedOut>
                  <div className="space-y-2">
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="w-full justify-start">
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-foreground-soft)]">Account</span>
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "h-8 w-8"
                        }
                      }}
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
