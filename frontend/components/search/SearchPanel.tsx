"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import SearchBar from "@/components/SearchBar";

interface SearchPanelProps {
  initialQuery: string;
}

export function SearchPanel({ initialQuery }: SearchPanelProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);

    if (typeof window === "undefined") {
      return;
    }

    const trimmed = value.trim();
    const params = new URLSearchParams(window.location.search);

    if (trimmed) {
      params.set("query", trimmed);
    } else {
      params.delete("query");
    }

    const search = params.toString();
    const target = search ? `${pathname}?${search}` : pathname;

    window.history.replaceState(null, "", target);
  };

  return (
    <section className="space-y-4" aria-label="Search controls">
      <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-foreground-soft)]">
            Active query
          </p>
          <p className="text-lg font-semibold text-secondary">
            {query.trim() ? query : "No query yet"}
          </p>
        </div>
        <span className="text-xs text-[var(--color-foreground-soft)]">
          Type in the field below to update this label.
        </span>
      </div>
      <div className="rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white p-3 shadow-sm">
        <SearchBar className="w-full" initialQuery={query} onSearch={handleSearch} />
      </div>
    </section>
  );
}
