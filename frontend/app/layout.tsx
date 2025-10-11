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
  title: "Shopify Search",
  description: "Search across Shopify stores",
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
    title: "Shopify Safari"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
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
