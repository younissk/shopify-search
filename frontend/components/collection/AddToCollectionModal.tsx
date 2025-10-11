"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getUserCollections,
  getProductCollections,
  createCollection,
  addProductToCollection,
  removeProductFromCollection,
} from "@/supabase/collection";
import { Collection } from "@/types/Collection";

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  domain: string;
}

export function AddToCollectionModal({
  isOpen,
  onClose,
  productId,
  domain,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [productCollectionIds, setProductCollectionIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, productId, domain]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [collectionsResult, productCollectionsResult] = await Promise.all([
        getUserCollections(),
        getProductCollections(productId, domain),
      ]);

      if (collectionsResult.data) {
        setCollections(collectionsResult.data);
      }

      if (productCollectionsResult.data) {
        const ids = new Set(productCollectionsResult.data.map((c) => c.id));
        setProductCollectionIds(ids);
      }
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCollection = async (collection: Collection) => {
    const collectionId = collection.id;
    setProcessingIds((prev) => new Set(prev).add(collectionId));

    try {
      if (productCollectionIds.has(collectionId)) {
        // Remove from collection
        // First find the item ID
        const { data: items } = await import("@/supabase/client").then(
          ({ supabase }) =>
            supabase
              .from("collection_items")
              .select("id")
              .eq("collection_id", collectionId)
              .eq("product_id", productId)
              .eq("domain", domain)
              .single()
        );

        if (items?.id) {
          const result = await removeProductFromCollection(collectionId, items.id);
          if (!result.error) {
            setProductCollectionIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(collectionId);
              return newSet;
            });
          }
        }
      } else {
        // Add to collection
        const result = await addProductToCollection({
          collection_id: collectionId,
          product_id: productId,
          domain,
        });

        if (result.data) {
          setProductCollectionIds((prev) => new Set(prev).add(collectionId));
        }
      }
    } catch (error) {
      console.error("Error toggling collection:", error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    setCreating(true);
    try {
      const result = await createCollection({
        name: newCollectionName.trim(),
        is_public: false,
      });

      if (result.data) {
        // Add the new collection to the list
        setCollections((prev) => [result.data!, ...prev]);
        
        // Automatically add the product to the new collection
        await addProductToCollection({
          collection_id: result.data.id,
          product_id: productId,
          domain,
        });
        
        setProductCollectionIds((prev) => new Set(prev).add(result.data!.id));
        setNewCollectionName("");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add to Collection</SheetTitle>
          <SheetDescription>
            Save this product to your collections for easy access later.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Collections list */}
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {collections.length === 0 && !showCreateForm ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    <p>You don&apos;t have any collections yet.</p>
                    <p className="mt-2">Create one to get started!</p>
                  </div>
                ) : (
                  collections.map((collection) => {
                    const isInCollection = productCollectionIds.has(collection.id);
                    const isProcessing = processingIds.has(collection.id);

                    return (
                      <button
                        key={collection.id}
                        onClick={() => handleToggleCollection(collection)}
                        disabled={isProcessing}
                        className="w-full flex items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-testid={`collection-${collection.id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {collection.name}
                          </div>
                          {collection.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {collection.description}
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : isInCollection ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="h-5 w-5 rounded border-2 border-gray-300" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Create new collection */}
              <div className="pt-4 border-t">
                {showCreateForm ? (
                  <form onSubmit={handleCreateCollection} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        autoFocus
                        disabled={creating}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewCollectionName("");
                        }}
                        disabled={creating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!newCollectionName.trim() || creating}
                    >
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Collection"
                      )}
                    </Button>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Collection
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

