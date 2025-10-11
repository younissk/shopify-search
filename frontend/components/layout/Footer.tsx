import Link from "next/link";
import { Compass, Mail, Github, Twitter, ExternalLink } from "lucide-react";

const footerLinks = {
  product: [
    { name: "Search", href: "/search" },
    { name: "Stores", href: "/domains" },
    { name: "About", href: "/about" },
  ],
  support: [
    { name: "Domain Requests", href: "/domain-requests" },
    { name: "Contact Support", href: "mailto:support@shopifysearch.com" },
    { name: "Documentation", href: "#" },
  ],
  legal: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Cookie Policy", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#824026] border-t-4 border-dashed border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:pb-6 lg:pb-8">
        <div className="">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-[var(--color-foreground-soft)]">
              <span>{new Date().getFullYear()} Shopify Search.</span>
              <span>•</span>
              <a href="/about">About</a>
              <span>•</span>
              <a href="/domain-requests">Domain Requests</a>
            </div>
            <div className="flex items-center space-x-4 text-sm text-[var(--color-foreground-soft)]">
              <a
                href="https://github.com/younissk/shopify-search"
                className="flex items-center space-x-1 transition-colors hover:text-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
