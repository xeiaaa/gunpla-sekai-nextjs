"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw } from "lucide-react";
import { FilterSection } from "@/components/filter-section";
import { KitCard } from "@/components/kit-card";
import { getFilterData } from "@/lib/actions/filters";
import { getFilteredKits } from "@/lib/actions/kits";

interface Kit {
  id: string;
  name: string;
  number: string;
  variant?: string | null;
  releaseDate?: Date | null;
  priceYen?: number | null;
  boxArt?: string | null;
  grade: string;
  productLine?: string | null;
  series?: string | null;
  releaseType?: string | null;
  mobileSuits: string[];
}

interface FilterData {
  productLines: Array<{ id: string; name: string; slug: string | null }>;
  mobileSuits: Array<{ id: string; name: string; slug: string | null }>;
  series: Array<{ id: string; name: string; slug: string | null }>;
  releaseTypes: Array<{ id: string; name: string; slug: string | null }>;
}

export default function KitsPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterData, setFilterData] = useState<FilterData>({
    productLines: [],
    mobileSuits: [],
    series: [],
    releaseTypes: [],
  });
  const [selectedProductLines, setSelectedProductLines] = useState<string[]>([]);
  const [selectedMobileSuits, setSelectedMobileSuits] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedReleaseTypes, setSelectedReleaseTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [order, setOrder] = useState("most-relevant");
  const [wishlistedKits, setWishlistedKits] = useState<Set<string>>(new Set());

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const filteredKits = await getFilteredKits({
        productLineIds: selectedProductLines,
        mobileSuitIds: selectedMobileSuits,
        seriesIds: selectedSeries,
        releaseTypeIds: selectedReleaseTypes,
        sortBy,
        order,
      });
      setKits(filteredKits);
    } catch (error) {
      console.error('Error loading kits:', error);
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProductLines, selectedMobileSuits, selectedSeries, selectedReleaseTypes, sortBy, order]);

  useEffect(() => {
    const loadFilterData = async () => {
      const data = await getFilterData();
      setFilterData(data);
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    loadKits();
  }, [loadKits]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const clearAllFilters = () => {
    setSelectedProductLines([]);
    setSelectedMobileSuits([]);
    setSelectedSeries([]);
    setSelectedReleaseTypes([]);
  };

  const applyFilters = () => {
    setIsFilterOpen(false);
    // Kits will be automatically reloaded due to useEffect dependency
  };

  const handleWishlistToggle = (kitId: string) => {
    setWishlistedKits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(kitId)) {
        newSet.delete(kitId);
      } else {
        newSet.add(kitId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Browse All Kits</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={toggleFilter}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Sidebar */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/50"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Filter Panel */}
            <div className="w-80 bg-card border-r shadow-lg overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Section */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Sort</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Sort By</label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="name">Name</option>
                        <option value="release-date">Release Date</option>
                        <option value="rating">Rating</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sorted by relevance to selected filters.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Order</label>
                      <select
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="most-relevant">Most Relevant First</option>
                        <option value="least-relevant">Least Relevant First</option>
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Sections */}
                <div className="space-y-0">
                  <FilterSection
                    title="Product Line"
                    options={filterData.productLines}
                    selectedValues={selectedProductLines}
                    onSelectionChange={setSelectedProductLines}
                    searchPlaceholder={`Search ${filterData.productLines.length} options...`}
                  />

                  <FilterSection
                    title="Mobile Suit"
                    options={filterData.mobileSuits}
                    selectedValues={selectedMobileSuits}
                    onSelectionChange={setSelectedMobileSuits}
                    searchPlaceholder={`Search ${filterData.mobileSuits.length} options...`}
                  />

                  <FilterSection
                    title="Series"
                    options={filterData.series}
                    selectedValues={selectedSeries}
                    onSelectionChange={setSelectedSeries}
                    searchPlaceholder={`Search ${filterData.series.length} options...`}
                  />

                  <FilterSection
                    title="Release Type"
                    options={filterData.releaseTypes}
                    selectedValues={selectedReleaseTypes}
                    onSelectionChange={setSelectedReleaseTypes}
                    searchPlaceholder={`Search ${filterData.releaseTypes.length} options...`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading kits...</p>
            </div>
          </div>
        ) : kits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No kits found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filters or clear all filters to see more results.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {kits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                onWishlistToggle={handleWishlistToggle}
                isWishlisted={wishlistedKits.has(kit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
