import Link from "next/link";
import { ExternalLink, Package, Store, TrendingUp } from "lucide-react";

import { Domain } from "@/types/Domain";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DomainCardProps {
  domain: Domain;
}

export function DomainCard({ domain }: DomainCardProps) {
  const productCount = domain.product_count || 0;
  const vendorCount = domain.vendor_count || 0;
  const displayName = domain.display_name || domain.domain;
  
  // Format price range
  const formatPriceRange = () => {
    if (!domain.price_range_min || !domain.price_range_max) return null;
    const min = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: domain.shop_currency || 'USD',
      minimumFractionDigits: 0,
    }).format(domain.price_range_min);
    const max = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: domain.shop_currency || 'USD',
      minimumFractionDigits: 0,
    }).format(domain.price_range_max);
    return `${min} - ${max}`;
  };

  const priceRange = formatPriceRange();


  return (
    <Card className="group relative overflow-hidden border bg-[var(--primary)] backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-secondary truncate">
              {displayName}
            </h3>
            <p className="text-sm text-[var(--color-foreground-soft)] truncate">
              {domain.domain}
            </p>
          </div>
        </div>


        {/* Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Product Count */}
            <div className="flex items-center gap-1 text-sm">
              <Package className="h-4 w-4 text-primary" />
              <span className="text-[var(--color-foreground-soft)]">
                {productCount.toLocaleString()} products
              </span>
            </div>
            {/* Separator */}
            <span className="mx-2 h-5 w-px bg-border rounded-sm" />
            {/* Vendor Count */}
            {vendorCount > 0 ? (
              <>
                <div className="flex items-center gap-1 text-sm">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-[var(--color-foreground-soft)]">
                    {vendorCount.toLocaleString()} vendors
                  </span>
                </div>
                <span className="mx-2 h-5 w-px bg-border rounded-sm" />
              </>
            ) : null}
            {/* Price Range */}
            {priceRange ? (
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-[var(--color-foreground-soft)]">
                  {priceRange}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 rounded- border border-primary text-xs font-semibold uppercase tracking-[0.18em] text-secondary hover:bg-primary/10">
            <Link href={`/domains/${domain.domain}`}>
              View Products
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a 
              href={`https://${domain.domain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
}
