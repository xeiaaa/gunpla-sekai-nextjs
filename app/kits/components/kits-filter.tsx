"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getKits } from "@/lib/actions/meilisearch";

export interface Kit {
  id: string;
  name: string;
  slug: string | null;
  boxArt: string | null;
  variant: string;
  releaseDate: string;
  priceYen: string;
}

interface KitsFilterProps {
  currentKit: Kit | null;
  onKitSelect: (kit: Kit | null) => void;
}

export function KitsFilter({ currentKit, onKitSelect }: KitsFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Kit[]>([]);
  const [selectedKit, setSelectedKit] = useState<Kit | null>(currentKit);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const TAKE = 20;

  console.info(selectedKit);

  // 🕐 Debounced search term
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // 🔁 Load first batch when dialog opens or search changes
  useEffect(() => {
    if (!open) return;
    const fetchInitial = async () => {
      setLoading(true);
      const { kits, totalCount } = await getKits({
        query: debouncedSearchTerm,
        limit: TAKE,
        offset: 0,
      });
      setSearchResults(kits);
      setOffset(kits.length);
      setHasMore(kits.length < totalCount);
      setLoading(false);
    };
    fetchInitial();
  }, [debouncedSearchTerm, open]);

  // 🔁 Infinite scroll observer
  useEffect(() => {
    if (!open) return;
    const observer = new IntersectionObserver(async (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        setLoading(true);
        const { kits: newBatch, totalCount } = await getKits({
          query: debouncedSearchTerm,
          limit: TAKE,
          offset,
        });

        setSearchResults((prev) => [...prev, ...newBatch]);
        setOffset((prev) => prev + newBatch.length);
        setHasMore(offset + newBatch.length < totalCount);
        setLoading(false);
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [offset, hasMore, loading, debouncedSearchTerm, open]);

  const handleKitToggle = (kit: Kit) => {
    // If clicking the same base kit, deselect it
    if (selectedKit?.id === kit.id) {
      setSelectedKit(null);
    } else {
      // Otherwise, select the new base kit
      setSelectedKit(kit);
    }
  };

  const handleRemoveKit = () => {
    setSelectedKit(null);
  };

  const handleSubmit = () => {
    onKitSelect(selectedKit);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedKit(currentKit);
    setSearchTerm("");
    setSearchResults([]);
    setOpen(false);
  };

  const isSelected = (kit: Kit) => selectedKit?.id === kit.id;

  // --- Card Display
  const KitSelectionCard = ({ kit }: { kit: Kit }) => {
    const imageUrl =
      kit.boxArt || "https://placehold.co/400x300?text=Mobile+Suit";
    return (
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer min-h-72">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image
              src={imageUrl}
              alt={kit.name}
              fill
              className="object-contain transition-transform duration-200 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl">
            {kit.name.slice(0, 30) + "..."}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  };

  // --- Main UI
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center cursor-pointer">
          {selectedKit ? selectedKit.name : "Select Base kit"}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl h-[90vh] flex flex-col overflow-hidden gap-2">
        <DialogHeader>
          <DialogTitle>Select Base Kit</DialogTitle>
          <DialogDescription>
            Search and select a base kit for this kit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="space-y-2 flex flex-col gap-2">
            <Label htmlFor="search">Search Base kits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
            {/* Search Results */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
              <Label>Search Results</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {loading && searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm.length < 2
                      ? "Type at least 2 characters to search"
                      : "No base kits found."}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {searchResults.map((kit) => (
                        <div
                          key={kit.id}
                          className="relative cursor-pointer"
                          onClick={() => handleKitToggle(kit)}
                        >
                          <div
                            className={cn(
                              "relative transition-all duration-200",
                              isSelected(kit) &&
                                "ring-2 ring-primary ring-offset-2"
                            )}
                          >
                            <KitSelectionCard kit={kit} />
                            {isSelected(kit) && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Infinite scroll sentinel */}
                    <div
                      ref={observerRef}
                      className="h-10 flex justify-center items-center text-muted-foreground text-sm"
                    >
                      {loading && "Loading more..."}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selected Base kit */}
            <div className="w-80 flex gap-2 flex-col min-h-0 bg-white">
              <Label>Selected</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {!selectedKit ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No base kit selected
                  </div>
                ) : (
                  <div>
                    <div className="relative bg-none">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveKit}
                        className="absolute top-2 right-2 h-8 w-8 p-0 z-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
                        <Image
                          src={
                            selectedKit.boxArt ||
                            "https://placehold.co/400x300?text=Mobile+Suit"
                          }
                          alt={selectedKit.name}
                          fill
                          className="object-contain"
                          sizes="300px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg pr-8">{selectedKit.name}</h3>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="mt-3 pt-3 border-t flex flex-col gap-1 text-sm">
                          <span>
                            Released Date:
                            <span className="ml-1">
                              {new Date(selectedKit.releaseDate)
                                .toISOString()
                                .split("T")[0] || "N/A"}
                            </span>
                          </span>
                          <span>
                            Price Yen: ¥{selectedKit.priceYen || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
