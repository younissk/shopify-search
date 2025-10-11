import { Github, ExternalLink } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#824026] border-t-4 border-dashed border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              About
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-foreground-soft)]">
              <li>
                <Link href="/about" className="transition-colors hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/domains" className="transition-colors hover:text-white">
                  Browse Stores
                </Link>
              </li>
              <li>
                <Link href="/collections" className="transition-colors hover:text-white">
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Support
            </h3>
            <ul className="space-y-2 text-sm text-[var(--color-foreground-soft)]">
              <li>
                <Link href="/domain-requests" className="transition-colors hover:text-white">
                  Domain Requests
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@shopifysearch.com"
                  className="transition-colors hover:text-white"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/younissk/shopify-search"
                  className="flex items-center space-x-2 text-sm text-[var(--color-foreground-soft)] transition-colors hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
            <p className="text-sm text-[var(--color-foreground-soft)]">
              © {currentYear} Shopify Search. All rights reserved.
            </p>
            <p className="text-xs text-[var(--color-foreground-soft)] italic">
              A portfolio project by{" "}
              <a
                href="https://github.com/younissk"
                className="text-white hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                @younissk
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
