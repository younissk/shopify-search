"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import SearchBar from "@/components/SearchBar";

interface SearchPanelProps {
  initialQuery: string;
  query?: string;
  onQueryChange?: (value: string) => void;
  loading?: boolean;
}

export function SearchPanel({
  initialQuery,
  query,
  onQueryChange,
  loading = false,
}: SearchPanelProps) {
  const pathname = usePathname();
  const isControlled = typeof query === "string";
  const [internalQuery, setInternalQuery] = useState(initialQuery);
  const activeQuery = isControlled ? query : internalQuery;

  useEffect(() => {
    if (!isControlled) {
      setInternalQuery(initialQuery);
    }
  }, [initialQuery, isControlled]);

  const handleSearch = (value: string) => {
    if (!isControlled) {
      setInternalQuery(value);
    }

    onQueryChange?.(value);

    if (typeof window === "undefined") {
      return;
    }

    const trimmed = value.trim();
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

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
      <SearchBar
        className="w-full"
        initialQuery={activeQuery}
        onSearch={handleSearch}
        loading={loading}
      />
    </section>
  );
}
