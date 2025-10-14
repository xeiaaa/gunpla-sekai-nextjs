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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMobileSuits } from "@/lib/actions/meilisearch";

export interface MobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  series: string | null;
  timeline: string | null;
  kitsCount: number;
  scrapedImages: string[];
}

interface MobileSuitsFilterProps {
  currentMobileSuits: MobileSuit[];
  onMobileSuitsSelect: (mobileSuits: MobileSuit[]) => void;
}

export function MobileSuitsFilter({
  currentMobileSuits,
  onMobileSuitsSelect,
}: MobileSuitsFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MobileSuit[]>([]);
  const [selectedMobileSuits, setSelectedMobileSuits] =
    useState<MobileSuit[]>(currentMobileSuits);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const TAKE = 20;

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
      const { mobileSuits, totalCount } = await getMobileSuits({
        query: debouncedSearchTerm,
        limit: TAKE,
        offset: 0,
      });
      setSearchResults(mobileSuits);
      setOffset(mobileSuits.length);
      setHasMore(mobileSuits.length < totalCount);
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
        const { mobileSuits: newBatch, totalCount } = await getMobileSuits({
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

  const handleMobileSuitToggle = (mobileSuit: MobileSuit) => {
    setSelectedMobileSuits((prev) => {
      const isSelected = prev.some((ms) => ms.id === mobileSuit.id);
      if (isSelected) {
        return prev.filter((ms) => ms.id !== mobileSuit.id);
      } else {
        return [...prev, mobileSuit];
      }
    });
  };

  const handleRemoveMobileSuit = (id: string) => {
    setSelectedMobileSuits((prev) => prev.filter((ms) => ms.id !== id));
  };

  const handleSubmit = () => {
    onMobileSuitsSelect(selectedMobileSuits);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedMobileSuits(currentMobileSuits);
    setSearchTerm("");
    setSearchResults([]);
    setOpen(false);
  };

  const isSelected = (mobileSuit: MobileSuit) =>
    selectedMobileSuits.some((ms) => ms.id === mobileSuit.id);

  // --- Card Display
  const MobileSuitSelectionCard = ({
    mobileSuit,
  }: {
    mobileSuit: MobileSuit;
  }) => {
    const imageUrl = mobileSuit.scrapedImages[0];
    return (
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer min-h-72">
        {imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg relative">
            <Image
              src={imageUrl}
              alt={mobileSuit.name}
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
            {mobileSuit.name.slice(0, 30) + "..."}
          </CardTitle>
          {mobileSuit.description && (
            <CardDescription className="line-clamp-3">
              {mobileSuit.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{mobileSuit.kitsCount} kits</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  // --- Main UI
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center cursor-pointer">
          {selectedMobileSuits.length > 0
            ? `${selectedMobileSuits.length} Mobile Suit${
                selectedMobileSuits.length === 1 ? "" : "s"
              } Selected`
            : "Select Mobile Suits"}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Mobile Suits</DialogTitle>
          <DialogDescription>
            Search and select multiple mobile suits for this kit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Search Bar */}
          <div className="space-y-2 flex flex-col gap-2">
            <Label htmlFor="search">Search Mobile Suits</Label>
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
            <div className="flex-1 flex flex-col min-h-0 gap-2">
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
                      : "No mobile suits found."}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                      {searchResults.map((mobileSuit) => (
                        <div
                          key={mobileSuit.id}
                          className="relative cursor-pointer"
                          onClick={() => handleMobileSuitToggle(mobileSuit)}
                        >
                          <div
                            className={cn(
                              "relative transition-all duration-200",
                              isSelected(mobileSuit) &&
                                "ring-2 ring-primary ring-offset-2"
                            )}
                          >
                            <MobileSuitSelectionCard mobileSuit={mobileSuit} />
                            {isSelected(mobileSuit) && (
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

            {/* Selected Mobile Suits */}
            <div className="w-80 flex flex-col min-h-0 gap-2">
              <Label>Selected ({selectedMobileSuits.length})</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {selectedMobileSuits.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No mobile suits selected
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {selectedMobileSuits.map((ms) => (
                      <div
                        key={ms.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{ms.name}</div>
                          {ms.series && (
                            <div className="text-sm text-muted-foreground truncate">
                              {ms.series}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMobileSuit(ms.id)}
                          className="ml-2 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
