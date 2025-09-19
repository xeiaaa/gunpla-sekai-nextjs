"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { searchMobileSuitsWithMeilisearch } from "@/lib/actions/meilisearch";
import { Search, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  series: string | null;
  timeline: string | null;
  kitsCount: number;
  scrapedImages: string[];
}

interface MobileSuitSelectionDialogProps {
  currentMobileSuits: MobileSuit[];
  onMobileSuitsSelect: (mobileSuits: MobileSuit[]) => void;
}

export function MobileSuitSelectionDialog({
  currentMobileSuits,
  onMobileSuitsSelect,
}: MobileSuitSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MobileSuit[]>([]);
  const [selectedMobileSuits, setSelectedMobileSuits] = useState<MobileSuit[]>(currentMobileSuits);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchMobileSuitsWithMeilisearch(query, 20);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching mobile suits:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [searchTerm, debouncedSearch]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const handleMobileSuitToggle = (mobileSuit: MobileSuit) => {
    setSelectedMobileSuits(prev => {
      const isSelected = prev.some(ms => ms.id === mobileSuit.id);
      if (isSelected) {
        return prev.filter(ms => ms.id !== mobileSuit.id);
      } else {
        return [...prev, mobileSuit];
      }
    });
  };

  const handleRemoveMobileSuit = (mobileSuitId: string) => {
    setSelectedMobileSuits(prev => prev.filter(ms => ms.id !== mobileSuitId));
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

  const isSelected = (mobileSuit: MobileSuit) => {
    return selectedMobileSuits.some(ms => ms.id === mobileSuit.id);
  };

  // Custom mobile suit card component without Link wrapper
  const MobileSuitSelectionCard = ({ mobileSuit }: { mobileSuit: MobileSuit }) => {
    const hasImage = mobileSuit.scrapedImages.length > 0;
    const imageUrl = hasImage ? mobileSuit.scrapedImages[0] : null;

    return (
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
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
          <CardTitle className="text-xl">{mobileSuit.name}</CardTitle>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {currentMobileSuits.length > 0
            ? `${currentMobileSuits.length} Mobile Suit${currentMobileSuits.length === 1 ? '' : 's'} Selected`
            : "Select Mobile Suits"
          }
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Mobile Suits</DialogTitle>
          <DialogDescription>
            Search and select mobile suits for this kit. You can select multiple mobile suits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            <Label htmlFor="search">Search Mobile Suits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Type to search mobile suits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
            {/* Search Results */}
            <div className="flex-1 flex flex-col min-h-0">
              <Label>Search Results</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm.length < 2
                      ? "Type at least 2 characters to search"
                      : "No mobile suits found matching your search."
                    }
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {searchResults.map((mobileSuit) => (
                      <div
                        key={mobileSuit.id}
                        className="relative cursor-pointer"
                        onClick={() => handleMobileSuitToggle(mobileSuit)}
                      >
                        <div className={cn(
                          "relative transition-all duration-200",
                          isSelected(mobileSuit) && "ring-2 ring-primary ring-offset-2"
                        )}>
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
                )}
              </div>
            </div>

            {/* Selected Mobile Suits */}
            <div className="w-80 flex flex-col min-h-0">
              <Label>Selected Mobile Suits ({selectedMobileSuits.length})</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {selectedMobileSuits.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No mobile suits selected
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {selectedMobileSuits.map((mobileSuit) => (
                      <div
                        key={mobileSuit.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-md"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{mobileSuit.name}</div>
                          {mobileSuit.series && (
                            <div className="text-sm text-muted-foreground truncate">
                              {mobileSuit.series}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMobileSuit(mobileSuit.id)}
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
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
          >
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
