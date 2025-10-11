"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Trash2 } from "lucide-react";

import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
} from "@/supabase/collection";
import { Collection } from "@/types/Collection";

interface EditCollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function EditCollectionPage({ params }: EditCollectionPageProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const loadCollection = useCallback(async () => {
    const resolvedParams = await params;
    const result = await getCollectionBySlug(resolvedParams.slug);

    if (result.error || !result.data) {
      router.push("/collections");
      return;
    }

    // Check ownership
    if (result.data.clerk_user_id !== userId) {
      router.push("/collections");
      return;
    }

    setCollection(result.data);
    setName(result.data.name);
    setDescription(result.data.description || "");
    setIsPublic(result.data.is_public);
    setLoading(false);
  }, [params, router, userId]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collection) return;

    setSaving(true);
    try {
      const result = await updateCollection(collection.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
      });

      if (result.data) {
        router.push(`/collections/${result.data.slug}`);
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!collection) return;

    setDeleting(true);
    try {
      const result = await deleteCollection(collection.id);

      if (!result.error) {
        router.push("/collections");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full min-h-[100px] rounded-md border-2 border-dashed border-[var(--background)] bg-transparent px-3 py-2 text-sm "
              maxLength={500}
            />
            <p className="text-xs ">{description.length}/500</p>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 rounded  text-primary focus:ring-primary"
            />
            <Label htmlFor="isPublic" className="cursor-pointer">
              Make this collection public
            </Label>
          </div>
          <p className="text-sm ">
            Public collections can be viewed and shared by anyone with the link.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="gap-2"
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Collection
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    collection and remove all bookmarked products from it.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-[var(--destructive)] hover:bg-[var(--destructive)]"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}

