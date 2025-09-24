"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw } from "lucide-react";
import { FilterSection } from "@/components/filter-section";
import { KitCard } from "@/components/kit-card";
import { useFilterData, useKitsInfinite } from "@/hooks/use-kits";

function KitsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Applied filters (what's currently filtering the results)
  const [appliedGrades, setAppliedGrades] = useState<string[]>([]);
  const [appliedProductLines, setAppliedProductLines] = useState<string[]>([]);
  const [appliedSeries, setAppliedSeries] = useState<string[]>([]);
  const [appliedReleaseTypes, setAppliedReleaseTypes] = useState<string[]>([]);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedIncludeVariants, setAppliedIncludeVariants] = useState(true);
  const [appliedIncludeExpansions, setAppliedIncludeExpansions] =
    useState(false);

  // Pending filters (what user has selected but not yet applied)
  const [pendingGrades, setPendingGrades] = useState<string[]>([]);
  const [pendingProductLines, setPendingProductLines] = useState<string[]>([]);
  const [pendingSeries, setPendingSeries] = useState<string[]>([]);
  const [pendingReleaseTypes, setPendingReleaseTypes] = useState<string[]>([]);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [pendingIncludeVariants, setPendingIncludeVariants] = useState(true);
  const [pendingIncludeExpansions, setPendingIncludeExpansions] =
    useState(false);

  const [appliedSortBy, setAppliedSortBy] = useState("relevance");
  const [appliedOrder, setAppliedOrder] = useState("most-relevant");
  const [pendingSortBy, setPendingSortBy] = useState("relevance");
  const [pendingOrder, setPendingOrder] = useState("most-relevant");
  const [kitCollectionStatuses] = useState<Map<string, string>>(new Map());
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  const isApplyingFilters = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // React Query hooks
  const {
    data: filterData = {
      grades: [],
      productLines: [],
      series: [],
      releaseTypes: [],
    },
    isLoading: filterDataLoading,
  } = useFilterData();

  const {
    data: kitsData,
    isLoading: kitsLoading,
    error: kitsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useKitsInfinite({
    gradeIds: appliedGrades,
    productLineIds: appliedProductLines,
    mobileSuitIds: [],
    seriesIds: appliedSeries,
    releaseTypeIds: appliedReleaseTypes,
    searchTerm: appliedSearchTerm,
    sortBy: appliedSortBy,
    order: appliedOrder,
    includeExpansions: appliedIncludeExpansions,
    includeVariants: appliedIncludeVariants,
  });

  // Flatten all pages of kits into a single array
  const kits = kitsData?.pages.flatMap((page) => page.kits) || [];
  const loading = filterDataLoading || kitsLoading;

  // Initialize from URL parameters
  useEffect(() => {
    if (isApplyingFilters.current) {
      // Skip re-initialization if this change came from applyFilters
      isApplyingFilters.current = false;
      return;
    }

    // Skip if we're currently updating the URL to prevent double loading
    if (isUpdatingUrl) {
      return;
    }

    // Only run if filterData is loaded (check if we have any filter data at all)
    const hasFilterData =
      filterData.grades.length > 0 ||
      filterData.productLines.length > 0 ||
      filterData.series.length > 0 ||
      filterData.releaseTypes.length > 0;

    if (!hasFilterData) {
      return;
    }

    const gradeSlugs =
      searchParams.get("grades")?.split(",").filter(Boolean) || [];
    const productLineSlugs =
      searchParams.get("productLines")?.split(",").filter(Boolean) || [];
    const seriesSlugs =
      searchParams.get("series")?.split(",").filter(Boolean) || [];
    const releaseTypeSlugs =
      searchParams.get("releaseTypes")?.split(",").filter(Boolean) || [];
    const searchTerm = searchParams.get("search") || "";
    const sortByParam = searchParams.get("sortBy") || "relevance";
    const orderParam = searchParams.get("order") || "most-relevant";
    const includeVariantsParam = searchParams.get("includeVariants") === "true";
    const includeExpansionsParam =
      searchParams.get("includeExpansions") === "true";

    // Convert slugs to IDs using filter data
    const gradeIds = gradeSlugs
      .map((slug) => filterData.grades.find((grade) => grade.slug === slug)?.id)
      .filter(Boolean) as string[];

    const productLineIds = productLineSlugs
      .map((slug) => filterData.productLines.find((pl) => pl.slug === slug)?.id)
      .filter(Boolean) as string[];

    const seriesIds = seriesSlugs
      .map((slug) => filterData.series.find((s) => s.slug === slug)?.id)
      .filter(Boolean) as string[];

    const releaseTypeIds = releaseTypeSlugs
      .map((slug) => filterData.releaseTypes.find((rt) => rt.slug === slug)?.id)
      .filter(Boolean) as string[];

    setAppliedGrades(gradeIds);
    setAppliedProductLines(productLineIds);
    setAppliedSeries(seriesIds);
    setAppliedReleaseTypes(releaseTypeIds);
    setAppliedSearchTerm(searchTerm);
    setAppliedSortBy(sortByParam);
    setAppliedOrder(orderParam);
    setAppliedIncludeVariants(includeVariantsParam);
    setAppliedIncludeExpansions(includeExpansionsParam);
    setPendingGrades(gradeIds);
    setPendingProductLines(productLineIds);
    setPendingSeries(seriesIds);
    setPendingReleaseTypes(releaseTypeIds);
    setPendingSearchTerm(searchTerm);
    setPendingSortBy(sortByParam);
    setPendingOrder(orderParam);
    setPendingIncludeVariants(includeVariantsParam);
    setPendingIncludeExpansions(includeExpansionsParam);
  }, [searchParams, filterData, isUpdatingUrl]);

  // Infinite scroll intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const updateUrlParams = (filters: {
    grades?: string[];
    productLines?: string[];
    series?: string[];
    releaseTypes?: string[];
    search?: string;
    sortBy?: string;
    order?: string;
    includeVariants?: boolean;
    includeExpansions?: boolean;
  }) => {
    setIsUpdatingUrl(true);

    const params = new URLSearchParams();

    if (filters.grades && filters.grades.length > 0) {
      const gradeSlugs = filters.grades
        .map((id) => filterData.grades.find((grade) => grade.id === id)?.slug)
        .filter(Boolean);
      if (gradeSlugs.length > 0) {
        params.set("grades", gradeSlugs.join(","));
      }
    }
    if (filters.productLines && filters.productLines.length > 0) {
      const productLineSlugs = filters.productLines
        .map((id) => filterData.productLines.find((pl) => pl.id === id)?.slug)
        .filter(Boolean);
      if (productLineSlugs.length > 0) {
        params.set("productLines", productLineSlugs.join(","));
      }
    }
    if (filters.series && filters.series.length > 0) {
      const seriesSlugs = filters.series
        .map((id) => filterData.series.find((s) => s.id === id)?.slug)
        .filter(Boolean);
      if (seriesSlugs.length > 0) {
        params.set("series", seriesSlugs.join(","));
      }
    }
    if (filters.releaseTypes && filters.releaseTypes.length > 0) {
      const releaseTypeSlugs = filters.releaseTypes
        .map((id) => filterData.releaseTypes.find((rt) => rt.id === id)?.slug)
        .filter(Boolean);
      if (releaseTypeSlugs.length > 0) {
        params.set("releaseTypes", releaseTypeSlugs.join(","));
      }
    }
    if (filters.search) {
      params.set("search", filters.search);
    }
    if (filters.sortBy && filters.sortBy !== "relevance") {
      params.set("sortBy", filters.sortBy);
    }
    if (filters.order && filters.order !== "most-relevant") {
      params.set("order", filters.order);
    }
    if (filters.includeVariants) {
      params.set("includeVariants", "true");
    }
    if (filters.includeExpansions) {
      params.set("includeExpansions", "true");
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/kits?${queryString}` : "/kits";
    router.push(newUrl);

    // Reset the flag after a brief delay to allow the URL change to complete
    setTimeout(() => setIsUpdatingUrl(false), 100);
  };

  const clearAllFilters = () => {
    setPendingGrades([]);
    setPendingProductLines([]);
    setPendingSeries([]);
    setPendingReleaseTypes([]);
    setPendingSearchTerm("");
    setPendingSortBy("relevance");
    setPendingOrder("most-relevant");
    setPendingIncludeVariants(false);
    setPendingIncludeExpansions(false);
  };

  const applyFilters = () => {
    isApplyingFilters.current = true;

    // Apply pending filters to applied filters
    setAppliedGrades(pendingGrades);
    setAppliedProductLines(pendingProductLines);
    setAppliedSeries(pendingSeries);
    setAppliedReleaseTypes(pendingReleaseTypes);
    setAppliedSearchTerm(pendingSearchTerm);
    setAppliedSortBy(pendingSortBy);
    setAppliedOrder(pendingOrder);
    setAppliedIncludeVariants(pendingIncludeVariants);
    setAppliedIncludeExpansions(pendingIncludeExpansions);

    // Update URL parameters
    updateUrlParams({
      grades: pendingGrades,
      productLines: pendingProductLines,
      series: pendingSeries,
      releaseTypes: pendingReleaseTypes,
      search: pendingSearchTerm,
      sortBy: pendingSortBy,
      order: pendingOrder,
      includeVariants: pendingIncludeVariants,
      includeExpansions: pendingIncludeExpansions,
    });

    setIsFilterOpen(false);
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
        {/* Results Summary */}
        {kitsData && kits.length > 0 && (
          <div className="mb-4">
            <p className="text-muted-foreground">
              Showing {kits.length}{" "}
              {kitsData.pages[0]?.total && `of ${kitsData.pages[0].total}`} kits
            </p>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 flex items-center justify-between">
          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={appliedIncludeVariants}
                onChange={(e) => {
                  setAppliedIncludeVariants(e.target.checked);
                  updateUrlParams({
                    grades: appliedGrades,
                    productLines: appliedProductLines,
                    series: appliedSeries,
                    releaseTypes: appliedReleaseTypes,
                    search: appliedSearchTerm,
                    sortBy: appliedSortBy,
                    order: appliedOrder,
                    includeVariants: e.target.checked,
                    includeExpansions: appliedIncludeExpansions,
                  });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Include Variants</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={appliedIncludeExpansions}
                onChange={(e) => {
                  setAppliedIncludeExpansions(e.target.checked);
                  updateUrlParams({
                    grades: appliedGrades,
                    productLines: appliedProductLines,
                    series: appliedSeries,
                    releaseTypes: appliedReleaseTypes,
                    search: appliedSearchTerm,
                    sortBy: appliedSortBy,
                    order: appliedOrder,
                    includeVariants: appliedIncludeVariants,
                    includeExpansions: e.target.checked,
                  });
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Include Expansions</span>
            </label>
          </div>

          {/* Filter Button */}
          <Button
            onClick={toggleFilter}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Show Full Filters
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
            <div className="w-80 bg-card border-r shadow-lg flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
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

                {/* Sort Section - Compact */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Sort</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={pendingSortBy}
                        onChange={(e) => {
                          setPendingSortBy(e.target.value);
                          // Reset order to appropriate default when sort changes
                          if (e.target.value === "relevance") {
                            setPendingOrder("most-relevant");
                          } else {
                            setPendingOrder("ascending");
                          }
                        }}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="name">Name</option>
                        <option value="release-date">Release Date</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={pendingOrder}
                        onChange={(e) => setPendingOrder(e.target.value)}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      >
                        {pendingSortBy === "relevance" ? (
                          <>
                            <option value="most-relevant">Most Relevant</option>
                            <option value="least-relevant">
                              Least Relevant
                            </option>
                          </>
                        ) : pendingSortBy === "name" ? (
                          <>
                            <option value="ascending">A-Z</option>
                            <option value="descending">Z-A</option>
                          </>
                        ) : pendingSortBy === "release-date" ? (
                          <>
                            <option value="descending">Newest</option>
                            <option value="ascending">Oldest</option>
                          </>
                        ) : (
                          <>
                            <option value="ascending">Lowest Rating</option>
                            <option value="descending">Highest Rating</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Sections */}
                <div className="space-y-0">
                  <FilterSection
                    title="Grade"
                    options={filterData.grades}
                    selectedValues={pendingGrades}
                    onSelectionChange={setPendingGrades}
                    searchPlaceholder={`Search ${filterData.grades.length} grades...`}
                  />

                  <FilterSection
                    title="Product Line"
                    options={filterData.productLines}
                    selectedValues={pendingProductLines}
                    onSelectionChange={setPendingProductLines}
                    searchPlaceholder={`Search ${filterData.productLines.length} options...`}
                  />

                  <FilterSection
                    title="Series"
                    options={filterData.series}
                    selectedValues={pendingSeries}
                    onSelectionChange={setPendingSeries}
                    searchPlaceholder={`Search ${filterData.series.length} options...`}
                  />

                  <FilterSection
                    title="Release Type"
                    options={filterData.releaseTypes}
                    selectedValues={pendingReleaseTypes}
                    onSelectionChange={setPendingReleaseTypes}
                    searchPlaceholder={`Search ${filterData.releaseTypes.length} options...`}
                  />
                </div>
              </div>

              {/* Fixed Action Buttons at Bottom */}
              <div className="border-t p-6 bg-card">
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
        ) : kitsError ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                Error loading kits
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Please try again or refresh the page.
              </p>
            </div>
          </div>
        ) : kits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No kits found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filters or clear all filters to see more
                results.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-stretch">
              {kits.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  collectionStatus={
                    kitCollectionStatuses.get(kit.id) as
                      | "WISHLIST"
                      | "PREORDER"
                      | "BACKLOG"
                      | "IN_PROGRESS"
                      | "BUILT"
                      | undefined
                  }
                  className="h-full"
                />
              ))}
            </div>

            {/* Infinite scroll trigger and loading indicator */}
            <div ref={loadMoreRef} className="py-8">
              {isFetchingNextPage && (
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground text-sm">
                      Loading more kits...
                    </p>
                  </div>
                </div>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <div className="flex items-center justify-center">
                  <Button
                    onClick={() => fetchNextPage()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Load More Kits
                  </Button>
                </div>
              )}

              {!hasNextPage && kits.length > 0 && (
                <div className="flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">
                    You&apos;ve reached the end of the results
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function KitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="bg-primary text-primary-foreground py-4">
            <div className="container mx-auto px-4">
              <h1 className="text-3xl font-bold">Browse All Kits</h1>
            </div>
          </div>
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <KitsPageContent />
    </Suspense>
  );
}
