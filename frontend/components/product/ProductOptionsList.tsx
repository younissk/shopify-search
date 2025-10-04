export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductOptionsListProps {
  options: ProductOption[];
}

export function ProductOptionsList({ options }: ProductOptionsListProps) {
  if (!options.length) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-[rgba(15,23,42,0.08)] bg-white px-6 py-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">Product options</h3>
      <dl className="mt-4 space-y-3 text-sm">
        {options.map((option) => (
          <div
            key={option.name}
            className="flex flex-col gap-1 text-[var(--color-foreground-soft)] sm:flex-row sm:items-start sm:gap-6"
          >
            <dt className="w-32 shrink-0 text-sm font-medium text-foreground">
              {option.name}
            </dt>
            <dd className="flex-1 text-sm">
              {option.values.join(", ")}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
