"use client";

import { useEffect, useState } from "react";
import { Gem } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getProductCollections } from "@/supabase/collection";
import { AddToCollectionModal } from "@/components/collection/AddToCollectionModal";

interface BookmarkButtonProps {
  productId: string;
  domain: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost";
}

export function BookmarkButton({
  productId,
  domain,
  className,
  size = "md",
  variant = "default",
}: BookmarkButtonProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      checkBookmarkStatus();
    }
  }, [isSignedIn, productId, domain]);

  const checkBookmarkStatus = async () => {
    try {
      const result = await getProductCollections(productId, domain);
      if (result.data && result.data.length > 0) {
        setIsBookmarked(true);
      } else {
        setIsBookmarked(false);
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSignedIn) {
      openSignIn?.();
      return;
    }

    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    checkBookmarkStatus();
  };

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }[size];

  const buttonSize = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }[size];

  return (
    <>
      <Button
        variant={variant}
        size="icon"
        className={cn(
          buttonSize,
          "rounded-[var(--radius-xs)] border-2 border-dashed border-[var(--background)] transition-all duration-200",
          isBookmarked
            ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]"
            : "bg-[var(--secondary)] text-gray-700 hover:bg-white hover:text-[var(--primary)]",
          className
        )}
        onClick={handleClick}
        disabled={loading}
        data-testid="bookmark-button"
      >
        <Gem
          className={cn(iconSize, isBookmarked && "fill-current")}
          strokeWidth={2}
        />
      </Button>

      {isSignedIn && (
        <AddToCollectionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          productId={productId}
          domain={domain}
        />
      )}
    </>
  );
}

