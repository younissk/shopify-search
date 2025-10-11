"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCollection } from "@/supabase/collection";

export default function NewCollectionPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  // Redirect if not signed in
  if (!isSignedIn) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    console.log("Creating collection...", { name, description, isPublic });
    
    setCreating(true);
    try {
      const result = await createCollection({
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });

      console.log("Collection creation result:", result);

      if (result.error) {
        setError(result.error);
        console.error("Error creating collection:", result.error);
        return;
      }

      if (result.data) {
        console.log("Navigating to collection:", result.data.slug);
        router.push(`/collections/${result.data.slug}`);
      } else {
        setError("Failed to create collection - no data returned");
      }
    } catch (error) {
      console.error("Exception creating collection:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageContainer>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Summer Fashion Finds"
              required
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your collection (optional)"
              className="w-full min-h-[100px] rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">{description.length}/500</p>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Make this collection public
            </Label>
          </div>
          <p className="text-sm text-gray-500">
            Public collections can be viewed and shared by anyone with the link.
          </p>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Collection"
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

