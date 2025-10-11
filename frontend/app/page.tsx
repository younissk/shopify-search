"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Gem, Settings } from "lucide-react";

import { ParallaxBackground } from "@/components/ParallaxBackground";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <ParallaxBackground />
      
      

      {/* Hero Section with Centered Search */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Badge */}
          <div className="flex justify-center">
            <span className="pill-badge">Unified Shopify Catalogue</span>
          </div>
          
          {/* Hero Headline */}
          <h1 className="text-5xl font-bold tracking-tight text-secondary sm:text-6xl md:text-7xl">
            Discover millions of products
            <br />
            <span className="text-primary">across Shopify stores</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--color-foreground-soft)] sm:text-xl">
            Search, compare, and explore inventory from trusted Shopify merchants in real-time. Find the perfect product with a single query.
          </p>
          
          {/* Centered Search Bar */}
          <div className="mx-auto w-full max-w-2xl pt-4">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search products, brands, stores..."
              className="w-full"
            />
            <p className="mt-3 text-sm text-[var(--color-foreground-soft)]">
              Try searching for watches, shoes, or skincare
            </p>
          </div>
          
        </div>
      </div>
    </>
  );
}
