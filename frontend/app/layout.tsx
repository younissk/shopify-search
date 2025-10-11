import type { Metadata } from "next";
import { Hanalei_Fill } from "next/font/google";
import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "@/components/layout/AppShell";

const hanaleiFill = Hanalei_Fill({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hanalei",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://shopifysearch.com"),
  title: {
    default: "Shopify Search - Discover Products Across Shopify Stores",
    template: "%s | Shopify Search"
  },
  description: "Search, compare, and explore inventory from trusted Shopify merchants in real-time. Find the perfect product across thousands of stores with a single query.",
  keywords: ["shopify", "product search", "ecommerce", "online shopping", "shopify stores", "product discovery"],
  authors: [{ name: "Shopify Search" }],
  creator: "Shopify Search",
  publisher: "Shopify Search",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Shopify Search - Discover Products Across Shopify Stores",
    description: "Search, compare, and explore inventory from trusted Shopify merchants in real-time.",
    siteName: "Shopify Search",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shopify Search - Discover Products Across Shopify Stores",
    description: "Search, compare, and explore inventory from trusted Shopify merchants in real-time.",
  },
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "Shopify Search",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://shopifysearch.com";
  
  // Structured Data: Organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Shopify Search",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "Search and discover products across thousands of Shopify stores",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@shopifysearch.com",
      contactType: "Customer Support"
    },
    sameAs: [
      "https://github.com/younissk/shopify-search"
    ]
  };

  // Structured Data: WebSite with Search Action
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shopify Search",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?query={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
        </head>
        <body
          className={`${hanaleiFill.variable} font-hanalei bg-background text-foreground antialiased`}
          suppressHydrationWarning
        >
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
