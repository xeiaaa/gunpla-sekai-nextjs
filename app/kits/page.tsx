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
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { KitCard } from "@/components/kit-card";
import { useFilterData } from "@/hooks/use-kits";
import { FilterSection } from "./components";
import { SignedIn, useAuth } from "@clerk/nextjs";
import Link from "next/link";

// Types
interface Kit {
  id: string;
  name: string;
  slug: string;
  number: string;
  variant: string | null;
  releaseDate: string | null;
  priceYen: number | null;
  boxArt: string | null;
  baseKitId: string | null;
  grade: {
    id: string;
    name: string;
    slug: string;
  };
  productLine: {
    id: string;
    name: string;
    slug: string;
    grade: {
      id: string;
      name: string;
      slug: string;
    };
    vendor: {
      id: string;
      name: string;
      slug: string;
      category: "OFFICIAL" | "THIRD_PARTY" | "BOOTLEG";
    };
  } | null;
  series: {
    id: string;
    name: string;
    slug: string;
  } | null;
  releaseType: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mobileSuits: string[];
  totalBuilds: number;
  totalReviews: number;
  reviews: {
    BUILD_QUALITY_ENGINEERING: number;
    ARTICULATION_POSEABILITY: number;
    DETAIL_ACCURACY: number;
    AESTHETICS_PROPORTIONS: number;
    ACCESSORIES_GIMMICKS: number;
    VALUE_EXPERIENCE: number;
    OVERALL: number;
  };
  collection: {
    OWNED: number;
    PREORDER: number;
    BACKLOG: number;
    IN_PROGRESS: number;
    BUILT: number;
    WISHLIST: number;
  };
  userCollection?: {
    status: "WISHLIST" | "PREORDER" | "BACKLOG" | "IN_PROGRESS" | "BUILT";
    notes?: string | null;
    price?: number | null;
    acquiredAt?: string | null;
  } | null;
}

interface MeilisearchResponse {
  items: Kit[];
  meta: {
    total: number;
    hasNextPage: boolean;
    nextCursor: string | null;
  };
}

// Consolidated state interface
interface FilterState {
  applied: {
    grades: string[];
    productLines: string[];
    series: string[];
    releaseTypes: string[];
    vendors: string[];
    mobileSuits: string[];
    searchTerm: string;
    includeVariants: boolean;
    includeExpansions: boolean;
    sortBy: string;
    sortDirection: "asc" | "desc";
    yearRange: { min: number; max: number };
  };
  pending: {
    grades: string[];
    productLines: string[];
    series: string[];
    releaseTypes: string[];
    vendors: string[];
    mobileSuits: string[];
    searchTerm: string;
    includeVariants: boolean;
    includeExpansions: boolean;
    sortBy: string;
    sortDirection: "asc" | "desc";
    yearRange: { min: number; max: number };
  };
  ui: {
    isFilterOpen: boolean;
    isUpdatingUrl: boolean;
    activePopover: string | null;
    popoverSearchTerms: Record<string, string>;
    isInitialized: boolean;
  };
}

// Action types for the reducer
type FilterAction =
  | { type: "SET_APPLIED_FILTERS"; payload: Partial<FilterState["applied"]> }
  | { type: "SET_PENDING_FILTERS"; payload: Partial<FilterState["pending"]> }
  | { type: "APPLY_PENDING_FILTERS" }
  | { type: "CLEAR_PENDING_FILTERS" }
  | { type: "SET_UI_STATE"; payload: Partial<FilterState["ui"]> }
  | { type: "INITIALIZE_FROM_URL"; payload: FilterState["applied"] }
  | { type: "SET_ACTIVE_POPOVER"; payload: string | null }
  | {
      type: "SET_POPOVER_SEARCH";
      payload: { filterType: string; searchTerm: string };
    };

// Initial state
const initialState: FilterState = {
  applied: {
    grades: [],
    productLines: [],
    series: [],
    releaseTypes: [],
    vendors: [],
    mobileSuits: [],
    searchTerm: "",
    includeVariants: true,
    includeExpansions: false,
    sortBy: "relevance",
    sortDirection: "desc",
    yearRange: { min: 1980, max: new Date().getFullYear() },
  },
  pending: {
    grades: [],
    productLines: [],
    series: [],
    releaseTypes: [],
    vendors: [],
    mobileSuits: [],
    searchTerm: "",
    includeVariants: true,
    includeExpansions: false,
    sortBy: "relevance",
    sortDirection: "desc",
    yearRange: { min: 1980, max: new Date().getFullYear() },
  },
  ui: {
    isFilterOpen: false,
    isUpdatingUrl: false,
    activePopover: null,
    popoverSearchTerms: {},
    isInitialized: false,
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
      const currentYear = new Date().getFullYear();
      return {
        ...state,
        pending: {
          grades: [],
          productLines: [],
          series: [],
          releaseTypes: [],
          vendors: [],
          mobileSuits: [],
          searchTerm: "",
          includeVariants: true,
          includeExpansions: false,
          sortBy: "relevance",
          sortDirection: "desc",
          yearRange: { min: 1980, max: currentYear },
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
        ui: { ...state.ui, isInitialized: true },
      };
    case "SET_ACTIVE_POPOVER":
      return {
        ...state,
        ui: { ...state.ui, activePopover: action.payload },
      };
    case "SET_POPOVER_SEARCH":
      return {
        ...state,
        ui: {
          ...state.ui,
          popoverSearchTerms: {
            ...state.ui.popoverSearchTerms,
            [action.payload.filterType]: action.payload.searchTerm,
          },
        },
      };
    default:
      return state;
  }
}

function KitsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken } = useAuth();

  // Consolidated state management
  const [state, dispatch] = useReducer(filterReducer, initialState);
  const [kitCollectionStatuses] = useState<Map<string, string>>(new Map());
  const isApplyingFilters = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Load filter metadata (vendors, grades, product lines, series, release types)
  const {
    data: filterData = {
      vendors: [],
      grades: [],
      productLines: [],
      series: [],
      releaseTypes: [],
    },
    isLoading: filterDataLoading,
  } = useFilterData();

  // Fetch kits using the new Meilisearch API endpoint
  const {
    data: kitsData,
    isLoading: kitsLoading,
    error: kitsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "kits-meilisearch",
      state.applied.searchTerm,
      state.applied.sortBy,
      state.applied.sortDirection,
      state.applied.includeVariants,
      state.applied.includeExpansions,
      state.applied.grades,
      state.applied.productLines,
      state.applied.series,
      state.applied.releaseTypes,
      state.applied.vendors,
      state.applied.mobileSuits,
      state.applied.yearRange,
    ],
    enabled: state.ui.isInitialized,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();

      // Add cursor for pagination
      if (pageParam) {
        params.set("cursor", pageParam);
      }

      // Add search query
      if (state.applied.searchTerm) {
        params.set("query", state.applied.searchTerm);
      }

      // Add sorting
      params.set("sortBy", state.applied.sortBy);
      params.set("sortDirection", state.applied.sortDirection);

      // Add filters for variants/expansions
      if (!state.applied.includeVariants) {
        params.set("isBaseKit", "true");
      }
      if (state.applied.includeExpansions) {
        params.set("isExpansion", "true");
      }

      // Add array filters
      if (state.applied.grades.length > 0) {
        params.set("gradeIds", state.applied.grades.join(","));
      }
      if (state.applied.productLines.length > 0) {
        params.set("productLineIds", state.applied.productLines.join(","));
      }
      if (state.applied.series.length > 0) {
        params.set("seriesIds", state.applied.series.join(","));
      }
      if (state.applied.releaseTypes.length > 0) {
        params.set("releaseTypeIds", state.applied.releaseTypes.join(","));
      }
      if (state.applied.vendors.length > 0) {
        params.set("vendorIds", state.applied.vendors.join(","));
      }
      if (state.applied.mobileSuits.length > 0) {
        params.set("mobileSuitIds", state.applied.mobileSuits.join(","));
      }

      // Add year range
      const currentYear = new Date().getFullYear();
      if (
        state.applied.yearRange.min !== 1980 ||
        state.applied.yearRange.max !== currentYear
      ) {
        params.set("startYear", state.applied.yearRange.min.toString());
        params.set("endYear", state.applied.yearRange.max.toString());
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

      // Check if user is authenticated and get token
      const token = await getToken();
      const endpoint = `${apiUrl}/kits/meilisearch?${params.toString()}`;

      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch kits");
      }

      const data: MeilisearchResponse = await response.json();
      return data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.nextCursor : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - keep data fresh longer
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on component mount if data exists
  });

  // Memoized computed values - transform API data to match KitCard component
  const kits = useMemo(
    () =>
      kitsData?.pages.flatMap((page) =>
        page.items.map((kit) => ({
          id: kit.id,
          name:
            kit.productLine?.vendor?.category === "BOOTLEG"
              ? `⚠️ ${kit.name} (Bootleg)`
              : kit.name,
          slug: kit.slug,
          number: kit.number,
          variant: kit.variant,
          releaseDate: kit.releaseDate ? new Date(kit.releaseDate) : null,
          priceYen: kit.priceYen,
          boxArt: kit.boxArt,
          grade: kit.grade?.name || null,
          productLine: kit.productLine?.name || null,
          series: kit.series?.name || null,
          releaseType: kit.releaseType?.name || null,
          mobileSuits: kit.mobileSuits,
          isBootleg: kit.productLine?.vendor?.category === "BOOTLEG",
          userCollection: kit.userCollection
            ? {
                ...kit.userCollection,
                acquiredAt: kit.userCollection.acquiredAt
                  ? new Date(kit.userCollection.acquiredAt)
                  : null,
              }
            : null,
        }))
      ) || [],
    [kitsData]
  );

  const totalKits = useMemo(
    () => kitsData?.pages[0]?.meta.total || 0,
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
    const vendorSlugs =
      searchParams.get("vendors")?.split(",").filter(Boolean) || [];
    const mobileSuitSlugs =
      searchParams.get("mobileSuits")?.split(",").filter(Boolean) || [];
    const searchTerm = searchParams.get("search") || "";
    const sortByParam = searchParams.get("sortBy") || "relevance";
    const sortDirectionParam = (searchParams.get("sortDirection") || "desc") as
      | "asc"
      | "desc";
    const includeVariantsParam =
      searchParams.get("includeVariants") !== "false";
    const includeExpansionsParam =
      searchParams.get("includeExpansions") === "true";
    const yearMinParam = parseInt(searchParams.get("yearMin") || "1980");
    const yearMaxParam = parseInt(
      searchParams.get("yearMax") || new Date().getFullYear().toString()
    );

    return {
      gradeSlugs,
      productLineSlugs,
      seriesSlugs,
      releaseTypeSlugs,
      vendorSlugs,
      mobileSuitSlugs,
      searchTerm,
      sortByParam,
      sortDirectionParam,
      includeVariantsParam,
      includeExpansionsParam,
      yearMinParam,
      yearMaxParam,
    };
  }, [searchParams]);

  // Memoized filter data conversion
  const convertedFilters = useMemo(() => {
    if (
      !filterData.vendors.length &&
      !filterData.grades.length &&
      !filterData.productLines.length &&
      !filterData.series.length &&
      !filterData.releaseTypes.length
    ) {
      return null;
    }

    const vendorIds = urlParams.vendorSlugs
      .map(
        (slug) => filterData.vendors.find((vendor) => vendor.slug === slug)?.id
      )
      .filter(Boolean) as string[];

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
      vendors: vendorIds,
      grades: gradeIds,
      productLines: productLineIds,
      series: seriesIds,
      releaseTypes: releaseTypeIds,
      mobileSuits: urlParams.mobileSuitSlugs,
      searchTerm: urlParams.searchTerm,
      sortBy: urlParams.sortByParam,
      sortDirection: urlParams.sortDirectionParam,
      includeVariants: urlParams.includeVariantsParam,
      includeExpansions: urlParams.includeExpansionsParam,
      yearRange: {
        min: urlParams.yearMinParam,
        max: urlParams.yearMaxParam,
      },
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
      // No filter data yet, wait for it to load
      return;
    }

    // Initialize from URL params
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

  const updateUrlParams = useCallback(
    (filters: {
      grades?: string[];
      productLines?: string[];
      series?: string[];
      releaseTypes?: string[];
      vendors?: string[];
      mobileSuits?: string[];
      search?: string;
      sortBy?: string;
      sortDirection?: "asc" | "desc";
      includeVariants?: boolean;
      includeExpansions?: boolean;
      yearRange?: { min: number; max: number };
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
      if (filters.vendors && filters.vendors.length > 0) {
        const vendorSlugs = filters.vendors
          .map(
            (id) => filterData.vendors.find((vendor) => vendor.id === id)?.slug
          )
          .filter(Boolean);
        if (vendorSlugs.length > 0) {
          params.set("vendors", vendorSlugs.join(","));
        }
      }
      if (filters.mobileSuits && filters.mobileSuits.length > 0) {
        params.set("mobileSuits", filters.mobileSuits.join(","));
      }
      if (filters.search) {
        params.set("search", filters.search);
      }
      if (filters.sortBy && filters.sortBy !== "relevance") {
        params.set("sortBy", filters.sortBy);
      }
      if (filters.sortDirection && filters.sortDirection !== "desc") {
        params.set("sortDirection", filters.sortDirection);
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
      if (filters.yearRange) {
        const { min, max } = filters.yearRange;
        const currentYear = new Date().getFullYear();
        if (min !== 1980 || max !== currentYear) {
          params.set("yearMin", min.toString());
          params.set("yearMax", max.toString());
        }
      }

      const queryString = params.toString();
      const newUrl = queryString ? `/kits?${queryString}` : "/kits";

      router.push(newUrl);
    },
    [filterData, router]
  );

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
        vendors: state.pending.vendors,
        mobileSuits: state.pending.mobileSuits,
        search: state.pending.searchTerm,
        sortBy: state.pending.sortBy,
        sortDirection: state.pending.sortDirection,
        includeVariants: state.pending.includeVariants,
        includeExpansions: state.pending.includeExpansions,
        yearRange: state.pending.yearRange,
      });
    });
  }, [state.pending, updateUrlParams, startTransition]);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: "CLEAR_PENDING_FILTERS" });
    // Auto-apply after clearing
    setTimeout(() => {
      applyFilters();
    }, 0);
  }, [applyFilters]);

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

  const handlePendingVendorsChange = useCallback((vendors: string[]) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { vendors } });
  }, []);

  const handlePendingMobileSuitsChange = useCallback(
    (mobileSuits: string[]) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { mobileSuits } });
    },
    []
  );

  const handlePendingSortByChange = useCallback((sortBy: string) => {
    dispatch({ type: "SET_PENDING_FILTERS", payload: { sortBy } });
  }, []);

  const handlePendingSortDirectionChange = useCallback(
    (sortDirection: "asc" | "desc") => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { sortDirection } });
    },
    []
  );

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

  const handlePendingYearRangeChange = useCallback(
    (yearRange: { min: number; max: number }) => {
      dispatch({ type: "SET_PENDING_FILTERS", payload: { yearRange } });
    },
    []
  );

  // Popover handlers
  const handlePopoverOpen = useCallback((filterType: string) => {
    dispatch({ type: "SET_ACTIVE_POPOVER", payload: filterType });
  }, []);

  const handlePopoverClose = useCallback(() => {
    dispatch({ type: "SET_ACTIVE_POPOVER", payload: null });
  }, []);

  const handlePopoverSearchChange = useCallback(
    (filterType: string, searchTerm: string) => {
      dispatch({
        type: "SET_POPOVER_SEARCH",
        payload: { filterType, searchTerm },
      });
    },
    []
  );

  // Click-outside handling is now done in FilterSection component with auto-apply

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Filter Section */}
        <FilterSection
          state={state}
          filterData={filterData}
          onPopoverOpen={handlePopoverOpen}
          onPopoverClose={handlePopoverClose}
          onPopoverSearchChange={handlePopoverSearchChange}
          onPendingGradesChange={handlePendingGradesChange}
          onPendingProductLinesChange={handlePendingProductLinesChange}
          onPendingSeriesChange={handlePendingSeriesChange}
          onPendingReleaseTypesChange={handlePendingReleaseTypesChange}
          onPendingVendorsChange={handlePendingVendorsChange}
          onPendingMobileSuitsChange={handlePendingMobileSuitsChange}
          onPendingSortByChange={handlePendingSortByChange}
          onPendingSortDirectionChange={handlePendingSortDirectionChange}
          onPendingIncludeVariantsChange={handlePendingIncludeVariantsChange}
          onPendingIncludeExpansionsChange={
            handlePendingIncludeExpansionsChange
          }
          onPendingYearRangeChange={handlePendingYearRangeChange}
          onClearAllFilters={clearAllFilters}
          onApplyFilters={applyFilters}
        />

        {/* Main Content - Kits Grid */}
        <main className="min-w-0">
          {/* Results Summary */}
          <div className="mb-4 flex w-full justify-between">
            {kitsData && kits.length > 0 && (
              <div className="mb-6">
                <p className="text-muted-foreground">
                  Showing {kits.length} of {totalKits} kits
                </p>
              </div>
            )}

            <SignedIn>
              <div className="flex items-center gap-2">
                {"The kit you're looking for isn't here?"}
                <Button asChild>
                  <Link href={`/kits/new`}>Add Kit</Link>
                </Button>
              </div>
            </SignedIn>
          </div>

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
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-stretch"
                style={{
                  contain: "layout style paint",
                  contentVisibility: "auto",
                }}
              >
                {kits.map((kit) => (
                  <KitCard
                    key={kit.id}
                    kit={kit}
                    collectionStatus={
                      kit.userCollection?.status ||
                      (kitCollectionStatuses.get(kit.id) as
                        | "WISHLIST"
                        | "PREORDER"
                        | "BACKLOG"
                        | "IN_PROGRESS"
                        | "BUILT"
                        | undefined)
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
        </main>
      </div>
    </div>
  );
}

export default function KitsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
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
