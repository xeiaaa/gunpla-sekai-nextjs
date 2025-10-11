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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { KitCard } from "@/components/kit-card";
import { useFilterData } from "@/hooks/use-kits";
import { X, Search } from "lucide-react";

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

// Filter Popover Component
interface FilterPopoverProps {
  title: string;
  options: Array<{ id: string; name: string; count?: number }>;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

function FilterPopover({
  title,
  options,
  selectedValues,
  onSelectionChange,
  onClose,
  searchTerm,
  onSearchChange,
}: FilterPopoverProps) {
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  const handleToggleOption = (optionId: string) => {
    const isSelected = selectedValues.includes(optionId);
    if (isSelected) {
      onSelectionChange(selectedValues.filter((id) => id !== optionId));
    } else {
      onSelectionChange([...selectedValues, optionId]);
    }
  };

  const handleReset = () => {
    onSelectionChange([]);
  };

  return (
    <div
      className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      data-popover
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
        <div className="flex items-center">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-sm border-none outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {/* Options List */}
      <div className="max-h-80 overflow-y-auto">
        {filteredOptions.map((option) => (
          <label
            key={option.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.id)}
                onChange={() => handleToggleOption(option.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-3 text-sm text-gray-900">{option.name}</span>
            </div>
            {option.count !== undefined && (
              <span className="text-sm text-gray-500">{option.count}</span>
            )}
          </label>
        ))}
        {filteredOptions.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500">
            No {title.toLowerCase()} found
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Year Range Popover Component
interface YearRangePopoverProps {
  onClose: () => void;
  yearRange: { min: number; max: number };
  onRangeChange: (range: { min: number; max: number }) => void;
}

function YearRangePopover({
  onClose,
  yearRange,
  onRangeChange,
}: YearRangePopoverProps) {
  const [localRange, setLocalRange] = useState(yearRange);

  // Fetch year distribution data directly from database
  const { data: yearDistributionData, isLoading: isKitsLoading } = useQuery({
    queryKey: ["kits-year-distribution"],
    queryFn: async () => {
      const response = await fetch("/api/kits/year-distribution");
      if (!response.ok) {
        throw new Error("Failed to fetch year distribution data");
      }
      const result = await response.json();
      return result.data;
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });

  const processedHistogramData = useMemo(() => {
    return yearDistributionData || [];
  }, [yearDistributionData]);

  const maxCount = Math.max(
    ...processedHistogramData.map((d: { count: number }) => d.count)
  );
  const minYear = 1980;
  const maxYear = new Date().getFullYear();

  const handleSliderChange = (type: "min" | "max", value: number) => {
    const newRange = { ...localRange };
    newRange[type] = Math.max(minYear, Math.min(maxYear, value));

    // Ensure min doesn't exceed max and vice versa
    if (type === "min" && newRange.min > newRange.max) {
      newRange.max = newRange.min;
    } else if (type === "max" && newRange.max < newRange.min) {
      newRange.min = newRange.max;
    }

    setLocalRange(newRange);
    onRangeChange(newRange);
  };

  const handleInputChange = (type: "min" | "max", value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      handleSliderChange(type, numValue);
    }
  };

  const handleReset = () => {
    const resetRange = { min: minYear, max: maxYear };
    setLocalRange(resetRange);
    onRangeChange(resetRange);
  };

  return (
    <div
      className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
      data-popover
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Year</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Reset Button */}
      <div className="px-4 pt-3">
        <button
          onClick={handleReset}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Histogram and Range Slider */}
      <div className="px-4 pb-4 pl-12">
        {/* Histogram */}
        <div className="relative h-20 mb-8 mt-2">
          {/* Y-axis labels (kit count) */}
          <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 items-end w-8">
            <span>{maxCount}</span>
            <span>{Math.floor(maxCount / 2)}</span>
            <span>0</span>
          </div>

          {/* Chart bars */}
          <div className="flex items-end justify-between h-full">
            {isKitsLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                Loading chart data...
              </div>
            ) : (
              processedHistogramData.map(
                ({ year, count }: { year: number; count: number }) => {
                  const height = (count / maxCount) * 100;
                  const isInRange =
                    year >= localRange.min && year <= localRange.max;
                  const isSelected =
                    year === localRange.min || year === localRange.max;

                  return (
                    <div
                      key={year}
                      className={`w-1 transition-all duration-200 ${
                        isSelected
                          ? "bg-blue-600"
                          : isInRange
                          ? "bg-yellow-400"
                          : "bg-gray-200"
                      }`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${year}: ${count} kits`}
                    />
                  );
                }
              )
            )}
          </div>

          {/* X-axis labels (years) */}
          <div className="absolute -bottom-5 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>

          {/* Range Slider Track */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded cursor-pointer"
            onClick={(e) => {
              // Don't handle clicks if they're on the handles
              if ((e.target as HTMLElement).closest("[data-handle]")) {
                return;
              }

              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const clickPercent = clickX / rect.width;
              const clickedYear = Math.round(
                minYear + clickPercent * (maxYear - minYear)
              );
              const clampedYear = Math.max(
                minYear,
                Math.min(maxYear, clickedYear)
              );

              // Determine which handle to move based on which is closer
              const distanceToMin = Math.abs(clampedYear - localRange.min);
              const distanceToMax = Math.abs(clampedYear - localRange.max);

              if (distanceToMin < distanceToMax) {
                if (clampedYear <= localRange.max) {
                  handleSliderChange("min", clampedYear);
                }
              } else {
                if (clampedYear >= localRange.min) {
                  handleSliderChange("max", clampedYear);
                }
              }
            }}
          >
            {/* Active Range Track */}
            <div
              className="absolute top-0 h-1 bg-blue-300 rounded"
              style={{
                left: `${
                  ((localRange.min - minYear) / (maxYear - minYear)) * 100
                }%`,
                width: `${
                  ((localRange.max - localRange.min) / (maxYear - minYear)) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Range Slider Handles */}
          <div className="absolute bottom-0 left-0 right-0">
            {/* Min Handle */}
            <div
              data-handle="min"
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-3 hover:scale-110 transition-transform"
              style={{
                left: `${
                  ((localRange.min - minYear) / (maxYear - minYear)) * 100
                }%`,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startMin = localRange.min;
                const sliderRect =
                  e.currentTarget.parentElement!.getBoundingClientRect();
                const sliderWidth = sliderRect.width;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaPercent = deltaX / sliderWidth;
                  const deltaYears = Math.round(
                    deltaPercent * (maxYear - minYear)
                  );
                  const newMin = Math.max(
                    minYear,
                    Math.min(maxYear, startMin + deltaYears)
                  );

                  if (newMin <= localRange.max) {
                    handleSliderChange("min", newMin);
                  }
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
            />

            {/* Max Handle */}
            <div
              data-handle="max"
              className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-2 -translate-y-3 hover:scale-110 transition-transform"
              style={{
                left: `${
                  ((localRange.max - minYear) / (maxYear - minYear)) * 100
                }%`,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startMax = localRange.max;
                const sliderRect =
                  e.currentTarget.parentElement!.getBoundingClientRect();
                const sliderWidth = sliderRect.width;

                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaPercent = deltaX / sliderWidth;
                  const deltaYears = Math.round(
                    deltaPercent * (maxYear - minYear)
                  );
                  const newMax = Math.max(
                    minYear,
                    Math.min(maxYear, startMax + deltaYears)
                  );

                  if (newMax >= localRange.min) {
                    handleSliderChange("max", newMax);
                  }
                };

                const handleMouseUp = () => {
                  document.removeEventListener("mousemove", handleMouseMove);
                  document.removeEventListener("mouseup", handleMouseUp);
                };

                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);
              }}
            />
          </div>
        </div>

        {/* Min/Max Input Fields */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Min</label>
            <input
              type="number"
              value={localRange.min}
              onChange={(e) => handleInputChange("min", e.target.value)}
              min={minYear}
              max={maxYear}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-gray-400 mt-6">-</div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Max</label>
            <input
              type="number"
              value={localRange.max}
              onChange={(e) => handleInputChange("max", e.target.value)}
              min={minYear}
              max={maxYear}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
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

  // Load filter metadata (grades, product lines, series, release types)
  const {
    data: filterData = {
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
      const response = await fetch(
        `${apiUrl}/kits/meilisearch?${params.toString()}`
      );

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
          name: kit.name,
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
      vendors: urlParams.vendorSlugs,
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
        params.set("vendors", filters.vendors.join(","));
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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state.ui.activePopover) {
        const target = event.target as Element;
        if (!target.closest("[data-popover]")) {
          handlePopoverClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [state.ui.activePopover, handlePopoverClose]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Horizontal Filter Bar */}
        <div className="mb-6 bg-card border rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-4">
            {/* Filter Buttons */}
            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("vendors")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Vendors</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "vendors" && (
                <FilterPopover
                  title="Vendors"
                  options={[
                    { id: "bandai", name: "Bandai", count: 1250 },
                    { id: "kotobukiya", name: "Kotobukiya", count: 85 },
                    { id: "good-smile", name: "Good Smile Company", count: 45 },
                  ]}
                  selectedValues={state.pending.vendors}
                  onSelectionChange={handlePendingVendorsChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.vendors || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("vendors", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("productLines")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Product Lines</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "productLines" && (
                <FilterPopover
                  title="Product Lines"
                  options={filterData.productLines.map((line) => ({
                    ...line,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.productLines}
                  onSelectionChange={handlePendingProductLinesChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.productLines || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("productLines", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("grades")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Grades</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "grades" && (
                <FilterPopover
                  title="Grades"
                  options={filterData.grades.map((grade) => ({
                    ...grade,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.grades}
                  onSelectionChange={handlePendingGradesChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.grades || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("grades", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("series")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Series</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "series" && (
                <FilterPopover
                  title="Series"
                  options={filterData.series.map((series) => ({
                    ...series,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.series}
                  onSelectionChange={handlePendingSeriesChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.series || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("series", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("releaseTypes")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Release Type</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "releaseTypes" && (
                <FilterPopover
                  title="Release Type"
                  options={filterData.releaseTypes.map((type) => ({
                    ...type,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.releaseTypes}
                  onSelectionChange={handlePendingReleaseTypesChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.releaseTypes || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("releaseTypes", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("mobileSuits")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Mobile Suit</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "mobileSuits" && (
                <FilterPopover
                  title="Mobile Suit"
                  options={[
                    { id: "rx-78-2", name: "RX-78-2 Gundam", count: 45 },
                    { id: "zaku-ii", name: "Zaku II", count: 38 },
                    { id: "gundam-mk-ii", name: "Gundam Mk-II", count: 25 },
                    { id: "z-gundam", name: "Z Gundam", count: 32 },
                    { id: "nu-gundam", name: "Nu Gundam", count: 18 },
                    { id: "unicorn-gundam", name: "Unicorn Gundam", count: 42 },
                  ]}
                  selectedValues={state.pending.mobileSuits}
                  onSelectionChange={handlePendingMobileSuitsChange}
                  onClose={handlePopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.mobileSuits || ""}
                  onSearchChange={(term) =>
                    handlePopoverSearchChange("mobileSuits", term)
                  }
                />
              )}
            </div>

            <div className="relative" data-popover>
              <button
                onClick={() => handlePopoverOpen("year")}
                className="w-full p-2 text-sm border rounded-md bg-background hover:bg-gray-50 flex items-center justify-between"
              >
                <span>Year</span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {state.ui.activePopover === "year" && (
                <YearRangePopover
                  onClose={handlePopoverClose}
                  yearRange={state.pending.yearRange}
                  onRangeChange={handlePendingYearRangeChange}
                />
              )}
            </div>
          </div>

          {/* Filter Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button onClick={applyFilters} className="flex-1 sm:flex-none">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1 sm:flex-none flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear All
            </Button>
          </div>

          {/* Include Options */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.pending.includeVariants}
                  onChange={(e) =>
                    handlePendingIncludeVariantsChange(e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium">Include Variants</span>
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
                <span className="text-sm font-medium">Include Expansions</span>
              </label>
            </div>
          </div>

          {/* Sort and Display Options */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by:
                </label>
                <select
                  value={state.pending.sortBy}
                  onChange={(e) => handlePendingSortByChange(e.target.value)}
                  className="p-2 text-sm border rounded-md bg-background appearance-none pr-8 min-w-[140px]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name</option>
                  <option value="releaseDate">Release Date</option>
                  <option value="totalBuilds">Total Builds</option>
                  <option value="totalReviews">Total Reviews</option>
                  <option value="reviews.BUILD_QUALITY_ENGINEERING">
                    Build Quality
                  </option>
                  <option value="reviews.ARTICULATION_POSEABILITY">
                    Articulation
                  </option>
                  <option value="reviews.DETAIL_ACCURACY">
                    Detail Accuracy
                  </option>
                  <option value="reviews.AESTHETICS_PROPORTIONS">
                    Aesthetics
                  </option>
                  <option value="reviews.ACCESSORIES_GIMMICKS">
                    Accessories
                  </option>
                  <option value="reviews.VALUE_EXPERIENCE">Value</option>
                  <option value="reviews.OVERALL">Overall Rating</option>
                  <option value="collection.OWNED">Owned</option>
                  <option value="collection.PREORDER">Preorder</option>
                  <option value="collection.BACKLOG">Backlog</option>
                  <option value="collection.IN_PROGRESS">In Progress</option>
                  <option value="collection.BUILT">Built</option>
                  <option value="collection.WISHLIST">Wishlist</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none top-6">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order:
                </label>
                <select
                  value={state.pending.sortDirection}
                  onChange={(e) =>
                    handlePendingSortDirectionChange(
                      e.target.value as "asc" | "desc"
                    )
                  }
                  className="p-2 text-sm border rounded-md bg-background appearance-none pr-8 min-w-[120px]"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none top-6">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Display Options */}
            <div className="flex items-center gap-2">
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button className="p-2 border rounded-md hover:bg-gray-50">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Kits Grid */}
        <main className="min-w-0">
          {/* Results Summary */}
          {kitsData && kits.length > 0 && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {kits.length} of {totalKits} kits
              </p>
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
