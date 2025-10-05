"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
  initialQuery?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search products, brands, categories...",
  loading = false,
  className = "",
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative mx-auto w-full", className)}>
      <div
        className={cn(
          "relative flex items-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white shadow-sm transition-all duration-300",
          focused
            ? "border-primary/50 shadow-lg ring-2 ring-primary/20"
            : "hover:border-[rgba(15,23,42,0.2)]"
        )}
      >
        <Search
          className={cn(
            "pointer-events-none ml-4 h-5 w-5 text-muted-foreground transition-colors",
            focused && "text-primary"
          )}
        />
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => handleSearch(event.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-14 flex-1 border-0 bg-transparent px-4 text-base font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
          data-testid="search-input"
        />
        <div className="flex items-center gap-2 pr-4">
          {loading && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </span>
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(15,23,42,0.05)] text-[var(--color-foreground-soft)] transition hover:bg-primary/10 hover:text-primary"
              aria-label="Clear search"
              onMouseDown={(event) => event.preventDefault()}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
