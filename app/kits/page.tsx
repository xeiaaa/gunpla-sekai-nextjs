"use client";

import {
  useState,
  useEffect,
  Suspense,
  useRef,
  useReducer,
  useMemo,
  useCallback,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw } from "lucide-react";
import { FilterSection } from "@/components/filter-section";
import { KitCard } from "@/components/kit-card";
import { ErrorBoundary } from "@/components/error-boundary";
import { useFilterData, useKitsInfinite } from "@/hooks/use-kits";

// Consolidated state interface
interface FilterState {
  applied: {
    grades: string[];
    productLines: string[];
    series: string[];
    releaseTypes: string[];
    searchTerm: string;
    includeVariants: boolean;
    includeExpansions: boolean;
    sortBy: string;
    order: string;
  };
  pending: {
    grades: string[];
    productLines: string[];
    series: string[];
    releaseTypes: string[];
    searchTerm: string;
    includeVariants: boolean;
    includeExpansions: boolean;
    sortBy: string;
    order: string;
  };
  ui: {
    isFilterOpen: boolean;
    isUpdatingUrl: boolean;
  };
}

// Action types for the reducer
type FilterAction =
  | { type: "SET_APPLIED_FILTERS"; payload: Partial<FilterState["applied"]> }
  | { type: "SET_PENDING_FILTERS"; payload: Partial<FilterState["pending"]> }
  | { type: "APPLY_PENDING_FILTERS" }
  | { type: "CLEAR_PENDING_FILTERS" }
  | { type: "SET_UI_STATE"; payload: Partial<FilterState["ui"]> }
  | { type: "INITIALIZE_FROM_URL"; payload: FilterState["applied"] };

// Initial state
const initialState: FilterState = {
  applied: {
    grades: [],
    productLines: [],
    series: [],
    releaseTypes: [],
    searchTerm: "",
    includeVariants: true,
    includeExpansions: false,
    sortBy: "relevance",
    order: "most-relevant",
  },
  pending: {
    grades: [],
    productLines: [],
    series: [],
    releaseTypes: [],
    searchTerm: "",
    includeVariants: true,
    includeExpansions: false,
    sortBy: "relevance",
    order: "most-relevant",
  },
  ui: {
    isFilterOpen: false,
    isUpdatingUrl: false,
  },
};

// Reducer function
function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_APPLIED_FILTERS":
      return {
        ...state,
        applied: { ...state.applied, ...action.payload },
      };
    case "SET_PENDING_FILTERS":
      return {
        ...state,
        pending: { ...state.pending, ...action.payload },
      };
    case "APPLY_PENDING_FILTERS":
      return {
        ...state,
        applied: { ...state.pending },
        ui: { ...state.ui, isFilterOpen: false },
      };
    case "CLEAR_PENDING_FILTERS":
      return {
        ...state,
        pending: {
          grades: [],
          productLines: [],
          series: [],
          releaseTypes: [],
          searchTerm: "",
          includeVariants: true,
          includeExpansions: false,
          sortBy: "relevance",
          order: "most-relevant",
        },
      };
    case "SET_UI_STATE":
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };
    case "INITIALIZE_FROM_URL":
      return {
        ...state,
        applied: { ...action.payload },
        pending: { ...action.payload },
      };
    default:
      return state;
  }
}

function KitsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Consolidated state management
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [kitCollectionStatuses] = useState<Map<string, string>>(new Map());
  const isApplyingFilters = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

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
    gradeIds: state.applied.grades,
    productLineIds: state.applied.productLines,
    mobileSuitIds: [],
    seriesIds: state.applied.series,
    releaseTypeIds: state.applied.releaseTypes,
    searchTerm: state.applied.searchTerm,
    sortBy: state.applied.sortBy,
    order: state.applied.order,
    includeExpansions: state.applied.includeExpansions,
    includeVariants: state.applied.includeVariants,
  });

  // Memoized computed values
  const kits = useMemo(
    () => kitsData?.pages.flatMap((page) => page.kits) || [],
    [kitsData]
  );

  const loading = useMemo(
    () => filterDataLoading || kitsLoading,
    [filterDataLoading, kitsLoading]
  );

  // Memoized URL parameter processing
  const urlParams = useMemo(() => {
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
    const includeVariantsParam =
      searchParams.get("includeVariants") !== "false";
    const includeExpansionsParam =
      searchParams.get("includeExpansions") === "true";

    return {
      gradeSlugs,
      productLineSlugs,
      seriesSlugs,
      releaseTypeSlugs,
      searchTerm,
      sortByParam,
      orderParam,
      includeVariantsParam,
      includeExpansionsParam,
    };
  }, [searchParams]);

  // Memoized filter data conversion
  const convertedFilters = useMemo(() => {
    if (
      !filterData.grades.length &&
      !filterData.productLines.length &&
      !filterData.series.length &&
      !filterData.releaseTypes.length
    ) {
      return null;
    }

    const gradeIds = urlParams.gradeSlugs
      .map((slug) => filterData.grades.find((grade) => grade.slug === slug)?.id)
      .filter(Boolean) as string[];

    const productLineIds = urlParams.productLineSlugs
      .map((slug) => filterData.productLines.find((pl) => pl.slug === slug)?.id)
      .filter(Boolean) as string[];

    const seriesIds = urlParams.seriesSlugs
      .map((slug) => filterData.series.find((s) => s.slug === slug)?.id)
      .filter(Boolean) as string[];

    const releaseTypeIds = urlParams.releaseTypeSlugs
      .map((slug) => filterData.releaseTypes.find((rt) => rt.slug === slug)?.id)
      .filter(Boolean) as string[];

    return {
      grades: gradeIds,
      productLines: productLineIds,
      series: seriesIds,
      releaseTypes: releaseTypeIds,
      searchTerm: urlParams.searchTerm,
      sortBy: urlParams.sortByParam,
      order: urlParams.orderParam,
      includeVariants: urlParams.includeVariantsParam,
      includeExpansions: urlParams.includeExpansionsParam,
    };
  }, [urlParams, filterData]);

  // Initialize from URL parameters
  useEffect(() => {
    if (isApplyingFilters.current) {
      isApplyingFilters.current = false;
      return;
    }

    if (state.ui.isUpdatingUrl) {
      return;
    }

    if (!convertedFilters) {
      return;
    }

    dispatch({ type: "INITIALIZE_FROM_URL", payload: convertedFilters });
  }, [convertedFilters, state.ui.isUpdatingUrl]);

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

  const toggleFilter = useCallback(() => {
    dispatch({
      type: "SET_UI_STATE",
      payload: { isFilterOpen: !state.ui.isFilterOpen },
    });
  }, [state.ui.isFilterOpen]);

  const updateUrlParams = useCallback(
    (filters: {
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
      if (filters.includeVariants !== undefined) {
        params.set(
          "includeVariants",
          filters.includeVariants ? "true" : "false"
        );
      }
      if (filters.includeExpansions) {
        params.set("includeExpansions", "true");
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/kits?${queryString}` : "/kits";

      // In Next.js 15 App Router, router.push is immediate
      router.push(newUrl);
    },
    [filterData, router]
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING_FILTERS" });
  }, []);

  const applyFilters = useCallback(() => {
    isApplyingFilters.current = true;
    dispatch({ type: "APPLY_PENDING_FILTERS" });

    // Use startTransition for smooth filter application
    startTransition(() => {
      updateUrlParams({
        grades: state.pending.grades,
        productLines: state.pending.productLines,
        series: state.pending.series,
        releaseTypes: state.pending.releaseTypes,
        search: state.pending.searchTerm,
        sortBy: state.pending.sortBy,
        order: state.pending.order,
        includeVariants: state.pending.includeVariants,
        includeExpansions: state.pending.includeExpansions,
      });
    });
  }, [state.pending, updateUrlParams, startTransition]);

  // Memoized filter change handlers
  const handlePendingGradesChange = useCallback((grades: string[]) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { grades } });
  }, []);

  const handlePendingProductLinesChange = useCallback(
    (productLines: string[]) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { productLines } });
    },
    []
  );

  const handlePendingSeriesChange = useCallback((series: string[]) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { series } });
  }, []);

  const handlePendingReleaseTypesChange = useCallback(
    (releaseTypes: string[]) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { releaseTypes } });
    },
    []
  );

  const handlePendingSortByChange = useCallback((sortBy: string) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { sortBy } });
  }, []);

  const handlePendingOrderChange = useCallback((order: string) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { order } });
  }, []);

  const handlePendingIncludeVariantsChange = useCallback(
    (includeVariants: boolean) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { includeVariants } });
    },
    []
  );

  const handlePendingIncludeExpansionsChange = useCallback(
    (includeExpansions: boolean) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { includeExpansions } });
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Browse All Kits</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Controls */}
        <div className="mb-6 flex items-center justify-between">
          {/* Results Summary */}
          {kitsData && kits.length > 0 && (
            <p className="text-muted-foreground">
              Showing {kits.length}{" "}
              {kitsData.pages[0]?.total && `of ${kitsData.pages[0].total}`} kits
            </p>
          )}

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
        {state.ui.isFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/50"
              onClick={() =>
                dispatch({
                  type: "SET_UI_STATE",
                  payload: { isFilterOpen: false },
                })
              }
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
                    onClick={() =>
                      dispatch({
                        type: "SET_UI_STATE",
                        payload: { isFilterOpen: false },
                      })
                    }
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
                        value={state.pending.sortBy}
                        onChange={(e) => {
                          const newSortBy = e.target.value;
                          handlePendingSortByChange(newSortBy);

                          // Only reset order if it's not compatible with the new sort type
                          const currentOrder = state.pending.order;
                          const isCompatible =
                            (newSortBy === "relevance" &&
                              (currentOrder === "most-relevant" ||
                                currentOrder === "least-relevant")) ||
                            (newSortBy === "name" &&
                              (currentOrder === "ascending" ||
                                currentOrder === "descending")) ||
                            (newSortBy === "release-date" &&
                              (currentOrder === "ascending" ||
                                currentOrder === "descending")) ||
                            (newSortBy === "rating" &&
                              (currentOrder === "ascending" ||
                                currentOrder === "descending"));

                          if (!isCompatible) {
                            // Set appropriate default for new sort type
                            if (newSortBy === "relevance") {
                              handlePendingOrderChange("most-relevant");
                            } else {
                              handlePendingOrderChange("ascending");
                            }
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
                        value={state.pending.order}
                        onChange={(e) =>
                          handlePendingOrderChange(e.target.value)
                        }
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      >
                        {state.pending.sortBy === "relevance" ? (
                          <>
                            <option value="most-relevant">Most Relevant</option>
                            <option value="least-relevant">
                              Least Relevant
                            </option>
                          </>
                        ) : state.pending.sortBy === "name" ? (
                          <>
                            <option value="ascending">A-Z</option>
                            <option value="descending">Z-A</option>
                          </>
                        ) : state.pending.sortBy === "release-date" ? (
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

                {/* Include Options */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Include</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.pending.includeVariants}
                        onChange={(e) =>
                          handlePendingIncludeVariantsChange(e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">
                        Include Variants
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.pending.includeExpansions}
                        onChange={(e) =>
                          handlePendingIncludeExpansionsChange(e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">
                        Include Expansions
                      </span>
                    </label>
                  </div>
                </div>

                {/* Filter Sections */}
                <div className="space-y-0">
                  <ErrorBoundary>
                    <FilterSection
                      title="Grade"
                      options={filterData.grades}
                      selectedValues={state.pending.grades}
                      onSelectionChange={handlePendingGradesChange}
                      searchPlaceholder={`Search ${filterData.grades.length} grades...`}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <FilterSection
                      title="Product Line"
                      options={filterData.productLines}
                      selectedValues={state.pending.productLines}
                      onSelectionChange={handlePendingProductLinesChange}
                      searchPlaceholder={`Search ${filterData.productLines.length} options...`}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <FilterSection
                      title="Series"
                      options={filterData.series}
                      selectedValues={state.pending.series}
                      onSelectionChange={handlePendingSeriesChange}
                      searchPlaceholder={`Search ${filterData.series.length} options...`}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <FilterSection
                      title="Release Type"
                      options={filterData.releaseTypes}
                      selectedValues={state.pending.releaseTypes}
                      onSelectionChange={handlePendingReleaseTypesChange}
                      searchPlaceholder={`Search ${filterData.releaseTypes.length} options...`}
                    />
                  </ErrorBoundary>
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
                    onClick={() =>
                      dispatch({
                        type: "SET_UI_STATE",
                        payload: { isFilterOpen: false },
                      })
                    }
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
                  key={`${kit.id}-${kit.slug || "no-slug"}`}
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
