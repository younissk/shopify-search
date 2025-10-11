"use client";

import { useState } from "react";
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ShareMenuProps {
  collectionName: string;
  collectionSlug: string;
  description?: string;
}

export function ShareMenu({
  collectionName,
  collectionSlug,
  description,
}: ShareMenuProps) {
  const [copied, setCopied] = useState(false);
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/collections/${collectionSlug}`;
  const text = description
    ? `${collectionName} - ${description}`
    : collectionName;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    email: `mailto:?subject=${encodeURIComponent(
      collectionName
    )}&body=${encodeURIComponent(`Check out this collection: ${text}\n\n${url}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle>Share Collection</SheetTitle>
          <SheetDescription>
            Share &quot;{collectionName}&quot; with others
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all hover:border-primary hover:bg-primary/5"
            data-testid="copy-link-button"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <LinkIcon className="h-5 w-5 text-gray-700" />
            )}
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">
                {copied ? "Link copied!" : "Copy link"}
              </div>
              <div className="text-xs text-gray-500 truncate">{url}</div>
            </div>
          </button>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare("twitter")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/10"
              data-testid="share-twitter"
            >
              <Twitter className="h-5 w-5 text-[#1DA1F2]" />
              <span className="text-sm font-medium">Twitter</span>
            </button>

            <button
              onClick={() => handleShare("facebook")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-[#1877F2] hover:bg-[#1877F2]/10"
              data-testid="share-facebook"
            >
              <Facebook className="h-5 w-5 text-[#1877F2]" />
              <span className="text-sm font-medium">Facebook</span>
            </button>

            <button
              onClick={() => handleShare("linkedin")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-[#0A66C2] hover:bg-[#0A66C2]/10"
              data-testid="share-linkedin"
            >
              <Linkedin className="h-5 w-5 text-[#0A66C2]" />
              <span className="text-sm font-medium">LinkedIn</span>
            </button>

            <button
              onClick={() => handleShare("email")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 p-3 transition-all hover:border-gray-400 hover:bg-gray-100"
              data-testid="share-email"
            >
              <Mail className="h-5 w-5 text-gray-700" />
              <span className="text-sm font-medium">Email</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

