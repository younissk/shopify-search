"use client";

import { TextInput, Box, Transition, ActionIcon, Group } from "@mantine/core";
import { IconSearch, IconX, IconLoader2 } from "@tabler/icons-react";
import { useState, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search products, brands, categories...",
  loading = false,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, { open: setFocused, close: setBlurred }] = useDisclosure(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch?.(value);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      handleClear();
      inputRef.current?.blur();
    }
  };

  return (
    <Box className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <TextInput
        ref={inputRef}
        value={query}
        onChange={(event) => handleSearch(event.currentTarget.value)}
        onFocus={setFocused}
        onBlur={setBlurred}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="lg"
        radius="xl"
        leftSection={
          <IconSearch 
            size={20} 
            className={`transition-colors duration-200 ${
              focused ? "text-blue-500" : "text-gray-400"
            }`} 
          />
        }
        rightSection={
          <Group gap={4}>
            {loading && (
              <ActionIcon variant="transparent" size="sm" disabled>
                <IconLoader2 size={16} className="animate-spin text-blue-500" />
              </ActionIcon>
            )}
            {query && !loading && (
              <ActionIcon
                variant="transparent"
                size="sm"
                onClick={handleClear}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Clear search"
              >
                <IconX size={16} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              </ActionIcon>
            )}
          </Group>
        }
        styles={{
          input: {
            background: focused 
              ? "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(248,250,252,0.8) 100%)",
            backdropFilter: "blur(10px)",
            border: focused 
              ? "2px solid rgba(59, 130, 246, 0.3)"
              : "2px solid rgba(229, 231, 235, 0.3)",
            boxShadow: focused
              ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(59, 130, 246, 0.1)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: "16px",
            fontWeight: "500",
            color: "var(--foreground)",
            "&::placeholder": {
              color: "rgba(107, 114, 128, 0.8)",
              fontWeight: "400",
            },
            "&:hover": {
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
              borderColor: "rgba(59, 130, 246, 0.2)",
              boxShadow: "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -5px rgba(0, 0, 0, 0.04)",
            },
          },
          section: {
            color: "inherit",
          },
        }}
        className="w-full"
        data-testid="search-input"
      />
      
      {/* Animated focus ring */}
      <Transition
        mounted={focused}
        transition="scale"
        duration={200}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
              borderRadius: "24px",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
        )}
      </Transition>

      {/* Subtle glow effect */}
      <Transition
        mounted={focused}
        transition="fade"
        duration={300}
        timingFunction="ease-out"
      >
        {(styles) => (
          <Box
            style={{
              ...styles,
              position: "absolute",
              top: "-4px",
              left: "-4px",
              right: "-4px",
              bottom: "-4px",
              background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
              borderRadius: "26px",
              zIndex: -2,
              pointerEvents: "none",
            }}
          />
        )}
      </Transition>
    </Box>
  );
}
