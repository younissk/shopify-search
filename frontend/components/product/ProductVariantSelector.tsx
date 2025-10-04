import { ProductVariant } from "@/types/Product";
import { cn } from "@/lib/utils";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedId?: number | string;
  onSelect: (variant: ProductVariant) => void;
}

function formatPrice(price: string | number | null | undefined) {
  if (price == null) {
    return "Unavailable";
  }

  const numeric = Number.parseFloat(String(price));

  if (!Number.isFinite(numeric)) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numeric);
}

export function ProductVariantSelector({
  variants,
  selectedId,
  onSelect,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Available variants</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {variants.map((variant) => {
          const isSelected = String(selectedId) === String(variant.id);

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              data-selected={isSelected}
              className={cn(
                "group flex flex-col gap-2 rounded-[var(--radius)] border border-[rgba(15,23,42,0.12)] bg-white px-4 py-3 text-left transition",
                isSelected
                  ? "border-primary/60 bg-primary/10 shadow-[var(--shadow-soft)]"
                  : "hover:border-primary/40 hover:bg-primary/5"
              )}
            >
              <span className="font-medium text-foreground">{variant.title}</span>
              <span className="text-sm text-[var(--color-foreground-soft)]">
                {formatPrice(variant.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
