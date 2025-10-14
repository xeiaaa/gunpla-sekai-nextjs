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
import { Card, CardContent } from "@/components/ui/card";
import { KitImage } from "@/components/kit-image";
import { getKits } from "@/lib/actions/meilisearch";
import { Search, X, Check, Calendar, DollarSign, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Kit {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  releaseDate: Date | null;
  priceYen: number | null;
  boxArt: string | null;
  baseKitId: string | null;
  grade: string | null;
  productLine: string | null;
  series: string | null;
  releaseType: string | null;
  mobileSuits: string[];
}

interface KitCompatibleFilterProps {
  currentExpandedBy: Kit[];
  onExpandedBySelect: (expandedBy: Kit[]) => void;
  excludeKitId?: string; // Kit ID to exclude from search results (current kit)
}

export function KitCompatibleFilter({
  currentExpandedBy,
  onExpandedBySelect,
  excludeKitId,
}: KitCompatibleFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Kit[]>([]);
  const [selectedExpandedBy, setSelectedExpandedBy] =
    useState<Kit[]>(currentExpandedBy);
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
      try {
        const { kits, totalCount } = await getKits({
          query: debouncedSearchTerm,
          limit: TAKE,
          offset: 0,
        });

        // Filter out the current kit if excludeKitId is provided
        const filteredKits = excludeKitId
          ? kits.filter((kit) => kit.id !== excludeKitId)
          : kits;

        setSearchResults(filteredKits);
        setOffset(kits.length);
        setHasMore(kits.length < totalCount);
      } catch (error) {
        console.error("Error fetching kits:", error);
        setSearchResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, [debouncedSearchTerm, open, excludeKitId]);

  // 🔁 Infinite scroll observer
  useEffect(() => {
    if (!open) return;
    const observer = new IntersectionObserver(async (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        setLoading(true);
        try {
          const { kits: newBatch, totalCount } = await getKits({
            query: debouncedSearchTerm,
            limit: TAKE,
            offset,
          });

          // Filter out the current kit if excludeKitId is provided
          const filteredBatch = excludeKitId
            ? newBatch.filter((kit) => kit.id !== excludeKitId)
            : newBatch;

          setSearchResults((prev) => [...prev, ...filteredBatch]);
          setOffset((prev) => prev + newBatch.length);
          setHasMore(offset + newBatch.length < totalCount);
        } catch (error) {
          console.error("Error loading more kits:", error);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [offset, hasMore, loading, debouncedSearchTerm, open, excludeKitId]);

  const handleKitToggle = (kit: Kit) => {
    setSelectedExpandedBy((prev) =>
      prev.some((k) => k.id === kit.id)
        ? prev.filter((k) => k.id !== kit.id)
        : [...prev, kit]
    );
  };

  const handleRemoveExpandedBy = (kit: Kit) => {
    setSelectedExpandedBy((prev) => prev.filter((k) => k.id !== kit.id));
  };

  const handleSubmit = () => {
    onExpandedBySelect(selectedExpandedBy);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedExpandedBy(currentExpandedBy);
    setSearchTerm("");
    setSearchResults([]);
    setOpen(false);
  };

  const formatPrice = (priceYen: number | null | undefined) => {
    if (!priceYen) return null;
    return `¥${priceYen.toLocaleString()}`;
  };

  const formatReleaseDate = (date: Date | null | undefined) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Custom kit card component without Link wrapper
  const KitSelectionCard = ({ kit }: { kit: Kit }) => {
    return (
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer min-h-120">
        {/* Kit Image */}
        <div className="relative">
          <KitImage
            src={kit.boxArt || ""}
            alt={kit.name}
            className="aspect-[4/3] w-full"
          />

          <div className="absolute bottom-2 px-2 flex gap-2 justify-between w-full flex-wrap">
            {/* Grade Badge */}
            {kit.grade && (
              <div className="">
                <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm">
                  {kit.grade}
                </div>
              </div>
            )}

            {/* Product Line Badge */}
            {kit.productLine && (
              <div className="">
                <div className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs font-medium shadow-sm border">
                  {kit.productLine}
                </div>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          {/* Kit Name */}
          <div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {kit.name}
            </h3>
            {kit.variant && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {kit.variant}
              </p>
            )}
          </div>

          {/* Kit Number */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Tag className="h-3 w-3" />
            <span>#{kit.number}</span>
          </div>

          {/* Release Date and Price */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatReleaseDate(kit.releaseDate)}</span>
            </div>

            {kit.priceYen && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span className="font-medium">{formatPrice(kit.priceYen)}</span>
              </div>
            )}
          </div>

          {/* Series and Release Type */}
          {(kit.series || kit.releaseType) && (
            <div className="flex flex-wrap gap-1 text-xs">
              {kit.series && (
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                  {kit.series}
                </span>
              )}
              {kit.releaseType && (
                <span className="bg-muted text-muted-foreground px-2 py-1 rounded">
                  {kit.releaseType}
                </span>
              )}
            </div>
          )}

          {/* Mobile Suits (if any) */}
          {kit.mobileSuits && kit.mobileSuits.length > 0 && (
            <div className="pt-1 mt-auto">
              <div className="text-xs text-muted-foreground line-clamp-1">
                {Array.isArray(kit.mobileSuits) &&
                typeof kit.mobileSuits[0] === "string"
                  ? kit.mobileSuits.slice(0, 2).join(", ")
                  : kit.mobileSuits
                      .slice(0, 2)
                      .map((ms: any) => ms.name)
                      .join(", ")}
                {kit.mobileSuits.length > 2 &&
                  ` +${kit.mobileSuits.length - 2} more`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center cursor-pointer">
          {" "}
          {currentExpandedBy.length > 0
            ? `Compatible with ${currentExpandedBy.length} Kit(s)`
            : "Select Base Kits This Expansion Requires"}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Compatible Kits</DialogTitle>
          <DialogDescription>
            Search and select the base kits this accessory or expansion is
            compatible with. Multiple kits can be selected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            <Label htmlFor="search">Search Kits</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Type to search kits..."
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
                      : "No kits found matching your search."}
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
                              selectedExpandedBy.some((k) => k.id === kit.id) &&
                                "ring-2 ring-primary ring-offset-2"
                            )}
                          >
                            <KitSelectionCard kit={kit} />
                            {selectedExpandedBy.some(
                              (k) => k.id === kit.id
                            ) && (
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

            {/* Selected Expanded By */}
            <div className="w-80 flex flex-col min-h-0 gap-2">
              <Label>Kits That Expand This ({selectedExpandedBy.length})</Label>
              <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
                {selectedExpandedBy.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No kits selected
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {selectedExpandedBy.map((kit) => (
                      <div
                        key={kit.id}
                        className="flex items-center justify-between p-2 border rounded-md bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {kit.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{kit.number}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpandedBy(kit)}
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
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
