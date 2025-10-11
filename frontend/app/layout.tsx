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
