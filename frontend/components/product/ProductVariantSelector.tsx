import { ProductVariant } from "@/types/Product";
import Pill from "../ui/pill";

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedId?: number | string;
  onSelect: (variant: ProductVariant) => void;
}

export function ProductVariantSelector({
  variants,
  onSelect,
}: ProductVariantSelectorProps) {
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
      {variants.map((variant) => {
        return <Pill onClick={() => onSelect(variant)} key={variant.id} text={variant.title}></Pill>;
      })}
    </div>
  );
}
