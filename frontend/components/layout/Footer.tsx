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

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/your-username/shopify-search",
    icon: Github,
  },
  {
    name: "Twitter", 
    href: "https://twitter.com/shopifysearch",
    icon: Twitter,
  },
  {
    name: "Email",
    href: "mailto:hello@shopifysearch.com",
    icon: Mail,
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[rgba(15,23,42,0.08)] bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl font-bold text-secondary transition-colors hover:text-primary"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span>Shopify Search</span>
            </Link>
            <p className="mt-4 text-sm text-[var(--color-foreground-soft)]">
              Search across multiple Shopify stores to discover products from various merchants in one place.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-overlay)] text-[var(--color-foreground-soft)] transition-colors hover:bg-primary/10 hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-foreground-soft)] transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-foreground-soft)] transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-foreground-soft)] transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-[rgba(15,23,42,0.08)] pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-[var(--color-foreground-soft)]">
              <span>© 2024 Shopify Search. All rights reserved.</span>
              <span className="hidden sm:block">•</span>
              <span className="hidden sm:block">Built with Next.js & Supabase</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-[var(--color-foreground-soft)]">
              <a
                href="https://github.com/your-username/shopify-search"
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
