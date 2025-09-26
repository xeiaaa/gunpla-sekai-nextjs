"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KitExpansionType } from "@/generated/prisma";
import { ExternalLink, Plus, Trash2 } from "lucide-react";

interface Kit {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  boxArt: string | null;
  notes: string | null;
  productLine: {
    name: string;
    grade: {
      name: string;
    };
  } | null;
  expandedBy?: {
    id: string;
    kit: {
      id: string;
      name: string;
      number: string;
    };
    type: string;
  }[];
}

interface SelectedKit {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  boxArt: string | null;
  productLine: {
    name: string;
    grade: {
      name: string;
    };
  } | null;
  expansionType: KitExpansionType;
}

export default function KitAccessoriesDebugPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog state
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Kit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedKits, setSelectedKits] = useState<SelectedKit[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const scrollPositionRef = useRef<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchAccessoryKits();
  }, []);

  const fetchAccessoryKits = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/debug/accessory-kits");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setKits(data);
    } catch (error) {
      console.error("Error fetching accessory kits:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch kits");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await fetch(
        `/api/debug/search-kits?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching kits:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const addSelectedKit = (kit: Kit) => {
    if (!selectedKits.find((k) => k.id === kit.id)) {
      setSelectedKits([
        ...selectedKits,
        {
          ...kit,
          expansionType: KitExpansionType.CONVERSION_UPGRADE_PARTS,
        },
      ]);
    }
  };

  const removeSelectedKit = (kitId: string) => {
    setSelectedKits(selectedKits.filter((k) => k.id !== kitId));
  };

  const updateExpansionType = (
    kitId: string,
    expansionType: KitExpansionType
  ) => {
    setSelectedKits(
      selectedKits.map((k) => (k.id === kitId ? { ...k, expansionType } : k))
    );
  };

  const handleSubmit = async (expansionKitId: string) => {
    try {
      setSubmitting(true);

      const requestData = {
        expansionKitId,
        selectedKits: selectedKits.map((k) => ({
          kitId: k.id,
          expansionType: k.expansionType,
        })),
      };

      console.log("Submitting kit relations:", requestData);

      const response = await fetch("/api/debug/kit-relations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Reset dialog state
      setSelectedKits([]);
      setSearchQuery("");
      setSearchResults([]);
      setOpenDialogId(null);

      // Restore scroll position after dialog closes
      setTimeout(() => {
        window.scrollTo(0, scrollPositionRef.current);
      }, 100);
    } catch (error) {
      console.error("Error creating kit relations:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create kit relations";
      alert(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading accessory kits...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kit Accessories Debug</h1>
        <p className="text-muted-foreground mt-2">
          Kits with specific accessory keywords in notes or name ({kits.length}{" "}
          found)
        </p>
      </div>

      {kits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No accessory kits found with the specified keywords in their notes
            or names.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Accessory Kits</CardTitle>
            <CardDescription>
              Kits with notes containing: &quot;accessory kit&quot;,
              &quot;accessory for&quot;, &quot;accessory set&quot;, &quot;armor
              parts for&quot;, &quot;kit for&quot;, &quot;resin&quot; OR names
              containing: &quot;LED&quot;, &quot;expansion&quot;,
              &quot;effect&quot;
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left font-medium">
                      Image
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Name
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Number
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Slug
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Product Line
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Notes
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Compatible With
                    </th>
                    <th className="border border-border p-3 text-left font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kits.map((kit) => (
                    <tr key={kit.id} className="hover:bg-muted/50">
                      <td className="border border-border p-3">
                        {kit.boxArt ? (
                          <div className="relative w-16 h-16">
                            <Image
                              src={kit.boxArt}
                              alt={kit.name}
                              fill
                              className="object-contain rounded border"
                              sizes="64px"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="border border-border p-3 font-medium">
                        {kit.slug ? (
                          <Link
                            href={`/kits/${kit.slug}`}
                            target="_blank"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {kit.name}
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          kit.name
                        )}
                        {kit.variant && (
                          <span className="text-muted-foreground ml-1">
                            ({kit.variant})
                          </span>
                        )}
                      </td>
                      <td className="border border-border p-3 text-sm font-mono">
                        {kit.number}
                      </td>
                      <td className="border border-border p-3">
                        {kit.slug ? (
                          <a
                            href={`/kits/${kit.slug}`}
                            className="text-primary hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {kit.slug}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No slug
                          </span>
                        )}
                      </td>
                      <td className="border border-border p-3 text-sm">
                        {kit.productLine ? (
                          <div>
                            <div className="font-medium">
                              {kit.productLine.name}
                            </div>
                            <div className="text-muted-foreground">
                              {kit.productLine.grade.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No product line
                          </span>
                        )}
                      </td>
                      <td className="border border-border p-3 text-sm max-w-xs">
                        {kit.notes ? (
                          <div className="whitespace-normal break-words">
                            {kit.notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No notes
                          </span>
                        )}
                      </td>
                      <td className="border border-border p-3 text-sm max-w-xs">
                        {kit.expandedBy && kit.expandedBy.length > 0 ? (
                          <div className="space-y-1">
                            {kit.expandedBy.map((expansion) => (
                              <div key={expansion.id} className="text-xs">
                                <div className="font-medium">
                                  {expansion.kit.name}
                                </div>
                                <div className="text-muted-foreground">
                                  {expansion.kit.number} •{" "}
                                  {expansion.type
                                    .replace(/_/g, " ")
                                    .toLowerCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No expansions
                          </span>
                        )}
                      </td>
                      <td className="border border-border p-3">
                        <Dialog
                          open={openDialogId === kit.id}
                          onOpenChange={(open) => {
                            if (open) {
                              // Save current scroll position when opening
                              scrollPositionRef.current = window.scrollY;
                              setOpenDialogId(kit.id);
                            } else {
                              // Restore scroll position when closing
                              setOpenDialogId(null);
                              setTimeout(() => {
                                window.scrollTo(0, scrollPositionRef.current);
                              }, 100);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchQuery("");
                                setSearchResults([]);
                                setSelectedKits([]);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add Relations
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Add Kit Relations for {kit.name}
                              </DialogTitle>
                              <DialogDescription>
                                Search for kits to add as relations to this
                                expansion kit.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="mb-4 p-3 bg-muted rounded-lg">
                              <h4 className="font-medium mb-2">Kit Details:</h4>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Product Line:
                                  </span>{" "}
                                  {kit.productLine?.name || "No product line"}
                                  {kit.productLine?.grade.name && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      ({kit.productLine.grade.name})
                                    </span>
                                  )}
                                </div>
                                {kit.slug && (
                                  <div>
                                    <span className="font-medium">Slug:</span>{" "}
                                    {kit.slug}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">
                                    Kit Number:
                                  </span>{" "}
                                  {kit.number}
                                </div>
                              </div>
                            </div>

                            {kit.notes && (
                              <div className="mb-4 p-3 bg-muted rounded-lg">
                                <h4 className="font-medium mb-2">Kit Notes:</h4>
                                <p className="text-sm whitespace-normal break-words">
                                  {kit.notes}
                                </p>
                              </div>
                            )}

                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="search">
                                  Search Kits by Slug
                                </Label>
                                <Input
                                  id="search"
                                  placeholder="Enter kit slug to search..."
                                  value={searchQuery}
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                                {searchLoading && (
                                  <p className="text-sm text-muted-foreground">
                                    Searching...
                                  </p>
                                )}
                              </div>

                              {searchResults.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Search Results
                                  </h4>
                                  <div className="border rounded p-2 max-h-40 overflow-y-auto">
                                    {searchResults.map((resultKit) => (
                                      <div
                                        key={resultKit.id}
                                        className="flex items-center justify-between p-2 hover:bg-muted rounded"
                                      >
                                        <div className="flex items-center gap-2">
                                          {resultKit.boxArt && (
                                            <div className="relative w-8 h-8">
                                              <Image
                                                src={resultKit.boxArt}
                                                alt={resultKit.name}
                                                fill
                                                className="object-contain rounded"
                                                sizes="32px"
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-medium text-sm">
                                              {resultKit.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {resultKit.number}
                                              {resultKit.slug && (
                                                <span> • {resultKit.slug}</span>
                                              )}
                                              {resultKit.productLine?.name && (
                                                <span>
                                                  {" "}
                                                  • {resultKit.productLine.name}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() =>
                                            addSelectedKit(resultKit)
                                          }
                                          disabled={selectedKits.some(
                                            (k) => k.id === resultKit.id
                                          )}
                                        >
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedKits.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Selected Kits ({selectedKits.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {selectedKits.map((selectedKit) => (
                                      <div
                                        key={selectedKit.id}
                                        className="flex items-center justify-between p-3 border rounded"
                                      >
                                        <div className="flex items-center gap-2">
                                          {selectedKit.boxArt && (
                                            <div className="relative w-8 h-8">
                                              <Image
                                                src={selectedKit.boxArt}
                                                alt={selectedKit.name}
                                                fill
                                                className="object-contain rounded"
                                                sizes="32px"
                                              />
                                            </div>
                                          )}
                                          <div>
                                            <div className="font-medium text-sm">
                                              {selectedKit.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {selectedKit.number}
                                              {selectedKit.slug && (
                                                <span>
                                                  {" "}
                                                  • {selectedKit.slug}
                                                </span>
                                              )}
                                              {selectedKit.productLine
                                                ?.name && (
                                                <span>
                                                  {" "}
                                                  •{" "}
                                                  {selectedKit.productLine.name}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Select
                                            value={selectedKit.expansionType}
                                            onValueChange={(value) =>
                                              updateExpansionType(
                                                selectedKit.id,
                                                value as KitExpansionType
                                              )
                                            }
                                          >
                                            <SelectTrigger className="w-40">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.values(
                                                KitExpansionType
                                              ).map((type) => (
                                                <SelectItem
                                                  key={type}
                                                  value={type}
                                                >
                                                  {type
                                                    .replace(/_/g, " ")
                                                    .toLowerCase()}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                              removeSelectedKit(selectedKit.id)
                                            }
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setOpenDialogId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSubmit(kit.id)}
                                disabled={
                                  selectedKits.length === 0 || submitting
                                }
                              >
                                {submitting
                                  ? "Creating..."
                                  : `Create ${selectedKits.length} Relations`}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
