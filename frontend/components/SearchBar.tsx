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

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleSearch = (value: string) => {
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(query);
    } else if (event.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <div className={cn("relative mx-auto w-full", className)}>
      <div
        className={
          "relative flex items-center rounded-sm border-2 border-dashed border-[#824026] bg-[var(--primary)] backdrop-blur-sm transition-all duration-200"
        }
      >
        <Search
          className={cn(
            "pointer-events-none ml-3 h-4 w-4 text-muted-foreground transition-colors",
            focused && "text-primary"
          )}
        />
        <Input
          ref={inputRef}
          value={query}
          onChange={(event) => handleInputChange(event.currentTarget.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 flex-1 border-0 bg-transparent px-3 text-sm font-normal focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          data-testid="search-input"
        />
        <div className="flex items-center gap-1 pr-3">
          {loading && (
            <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10">
              <Loader2 className="h-3 w-3 animate-spin text-primary" />
            </span>
          )}
          {query && !loading && (
            <>
              <button
                type="button"
                onClick={() => handleSearch(query)}
                className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary transition hover:bg-primary/20"
                aria-label="Search"
                data-testid="search-button"
              >
                <Search className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="flex h-6 w-6 items-center justify-center rounded bg-[rgba(15,23,42,0.05)] text-[var(--color-foreground-soft)] transition hover:bg-primary/10 hover:text-primary"
                aria-label="Clear search"
                data-testid="clear-button"
                onMouseDown={(event) => event.preventDefault()}
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
