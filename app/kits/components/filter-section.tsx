"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { X, Search } from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Types
interface FilterPopoverProps {
  title: string;
  options: Array<{ id: string; name: string; count?: number }>;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

interface YearRangePopoverProps {
  onClose: () => void;
  yearRange: { min: number; max: number };
  onRangeChange: (range: { min: number; max: number }) => void;
}

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

interface FilterSectionProps {
  state: FilterState;
  filterData: {
    vendors: Array<{ id: string; name: string; slug: string }>;
    grades: Array<{ id: string; name: string; slug: string }>;
    productLines: Array<{ id: string; name: string; slug: string }>;
    series: Array<{ id: string; name: string; slug: string }>;
    releaseTypes: Array<{ id: string; name: string; slug: string }>;
  };
  onPopoverOpen: (filterType: string) => void;
  onPopoverClose: () => void;
  onPopoverSearchChange: (filterType: string, searchTerm: string) => void;
  onPendingGradesChange: (grades: string[]) => void;
  onPendingProductLinesChange: (productLines: string[]) => void;
  onPendingSeriesChange: (series: string[]) => void;
  onPendingReleaseTypesChange: (releaseTypes: string[]) => void;
  onPendingVendorsChange: (vendors: string[]) => void;
  onPendingMobileSuitsChange: (mobileSuits: string[]) => void;
  onPendingSortByChange: (sortBy: string) => void;
  onPendingSortDirectionChange: (sortDirection: "asc" | "desc") => void;
  onPendingIncludeVariantsChange: (includeVariants: boolean) => void;
  onPendingIncludeExpansionsChange: (includeExpansions: boolean) => void;
  onPendingYearRangeChange: (yearRange: { min: number; max: number }) => void;
  onClearAllFilters: () => void;
  onApplyFilters: () => void;
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

function YearRangePopover({
  onClose,
  yearRange,
  onRangeChange,
}: YearRangePopoverProps) {
  const [localRange, setLocalRange] = useState(yearRange);

  // Fetch year distribution data from the new API endpoint
  const { data: yearDistributionData, isLoading: isKitsLoading } = useQuery({
    queryKey: ["kits-year-distribution"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const response = await fetch(`${apiUrl}/kits/year-distribution`);
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

export default function FilterSection({
  state,
  filterData,
  onPopoverOpen,
  onPopoverClose,
  onPopoverSearchChange,
  onPendingGradesChange,
  onPendingProductLinesChange,
  onPendingSeriesChange,
  onPendingReleaseTypesChange,
  onPendingVendorsChange,
  onPendingMobileSuitsChange,
  onPendingSortByChange,
  onPendingSortDirectionChange,
  onPendingIncludeVariantsChange,
  onPendingIncludeExpansionsChange,
  onPendingYearRangeChange,
  onClearAllFilters,
  onApplyFilters,
}: FilterSectionProps) {
  return (
    <div className="mb-6 bg-card border rounded-lg shadow-sm">
      <div className="p-4 space-y-4">
        {/* Row 1: Primary Filters (Entity-level) */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Primary Filters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Vendor */}
            <div className="relative" data-popover>
              <button
                onClick={() => onPopoverOpen("vendors")}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                  state.pending.vendors.length > 0
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : ""
                }`}
              >
                <span className="truncate">Vendors</span>
                <div className="flex items-center gap-2">
                  {state.pending.vendors.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {state.pending.vendors.length}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
              </button>
              {state.ui.activePopover === "vendors" && (
                <FilterPopover
                  title="Vendors"
                  options={filterData.vendors.map((vendor) => ({
                    ...vendor,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.vendors}
                  onSelectionChange={onPendingVendorsChange}
                  onClose={onPopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.vendors || ""}
                  onSearchChange={(term) =>
                    onPopoverSearchChange("vendors", term)
                  }
                />
              )}
            </div>

            {/* Product Lines */}
            <div className="relative" data-popover>
              <button
                onClick={() => onPopoverOpen("productLines")}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                  state.pending.productLines.length > 0
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : ""
                }`}
              >
                <span className="truncate">Product Lines</span>
                <div className="flex items-center gap-2">
                  {state.pending.productLines.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {state.pending.productLines.length}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
              </button>
              {state.ui.activePopover === "productLines" && (
                <FilterPopover
                  title="Product Lines"
                  options={filterData.productLines.map((line) => ({
                    ...line,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.productLines}
                  onSelectionChange={onPendingProductLinesChange}
                  onClose={onPopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.productLines || ""}
                  onSearchChange={(term) =>
                    onPopoverSearchChange("productLines", term)
                  }
                />
              )}
            </div>

            {/* Grades */}
            <div className="relative" data-popover>
              <button
                onClick={() => onPopoverOpen("grades")}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                  state.pending.grades.length > 0
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : ""
                }`}
              >
                <span className="truncate">Grades</span>
                <div className="flex items-center gap-2">
                  {state.pending.grades.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {state.pending.grades.length}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
              </button>
              {state.ui.activePopover === "grades" && (
                <FilterPopover
                  title="Grades"
                  options={filterData.grades.map((grade) => ({
                    ...grade,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.grades}
                  onSelectionChange={onPendingGradesChange}
                  onClose={onPopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.grades || ""}
                  onSearchChange={(term) =>
                    onPopoverSearchChange("grades", term)
                  }
                />
              )}
            </div>

            {/* Series */}
            <div className="relative" data-popover>
              <button
                onClick={() => onPopoverOpen("series")}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                  state.pending.series.length > 0
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : ""
                }`}
              >
                <span className="truncate">Series</span>
                <div className="flex items-center gap-2">
                  {state.pending.series.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {state.pending.series.length}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
              </button>
              {state.ui.activePopover === "series" && (
                <FilterPopover
                  title="Series"
                  options={filterData.series.map((series) => ({
                    ...series,
                    count: undefined,
                  }))}
                  selectedValues={state.pending.series}
                  onSelectionChange={onPendingSeriesChange}
                  onClose={onPopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.series || ""}
                  onSearchChange={(term) =>
                    onPopoverSearchChange("series", term)
                  }
                />
              )}
            </div>

            {/* Mobile Suit */}
            <div className="relative" data-popover>
              <button
                onClick={() => onPopoverOpen("mobileSuits")}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                  state.pending.mobileSuits.length > 0
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : ""
                }`}
              >
                <span className="truncate">Mobile Suit</span>
                <div className="flex items-center gap-2">
                  {state.pending.mobileSuits.length > 0 && (
                    <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {state.pending.mobileSuits.length}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                    {
                      id: "unicorn-gundam",
                      name: "Unicorn Gundam",
                      count: 42,
                    },
                  ]}
                  selectedValues={state.pending.mobileSuits}
                  onSelectionChange={onPendingMobileSuitsChange}
                  onClose={onPopoverClose}
                  searchTerm={state.ui.popoverSearchTerms.mobileSuits || ""}
                  onSearchChange={(term) =>
                    onPopoverSearchChange("mobileSuits", term)
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Release & Metadata Filters */}
        <div className="flex flex-row items-start gap-8">
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Release & Metadata
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {/* Release Type */}
              <div className="relative w-40" data-popover>
                <button
                  onClick={() => onPopoverOpen("releaseTypes")}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                    state.pending.releaseTypes.length > 0
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : ""
                  }`}
                >
                  <span className="truncate">Release Type</span>
                  <div className="flex items-center gap-2">
                    {state.pending.releaseTypes.length > 0 && (
                      <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                        {state.pending.releaseTypes.length}
                      </span>
                    )}
                    <svg
                      className="w-4 h-4 text-gray-400 flex-shrink-0"
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
                </button>
                {state.ui.activePopover === "releaseTypes" && (
                  <FilterPopover
                    title="Release Type"
                    options={filterData.releaseTypes.map((type) => ({
                      ...type,
                      count: undefined,
                    }))}
                    selectedValues={state.pending.releaseTypes}
                    onSelectionChange={onPendingReleaseTypesChange}
                    onClose={onPopoverClose}
                    searchTerm={state.ui.popoverSearchTerms.releaseTypes || ""}
                    onSearchChange={(term) =>
                      onPopoverSearchChange("releaseTypes", term)
                    }
                  />
                )}
              </div>

              {/* Year Range */}
              <div className="relative w-40" data-popover>
                <button
                  onClick={() => onPopoverOpen("year")}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-background hover:border-primary/50 flex items-center justify-between transition-colors ${
                    state.pending.yearRange.min !== 1980 ||
                    state.pending.yearRange.max !== new Date().getFullYear()
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : ""
                  }`}
                >
                  <span className="truncate">Year</span>
                  {(state.pending.yearRange.min !== 1980 ||
                    state.pending.yearRange.max !==
                      new Date().getFullYear()) && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full whitespace-nowrap">
                      {state.pending.yearRange.min}-
                      {state.pending.yearRange.max}
                    </span>
                  )}
                  <svg
                    className="w-4 h-4 text-gray-400 ml-2"
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
                    onClose={onPopoverClose}
                    yearRange={state.pending.yearRange}
                    onRangeChange={onPendingYearRangeChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Include Options Section */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Include Options
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Include Variants - Chip Style */}
              <button
                onClick={() =>
                  onPendingIncludeVariantsChange(!state.pending.includeVariants)
                }
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                  state.pending.includeVariants
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-background text-gray-700 border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                {state.pending.includeVariants && (
                  <span className="mr-1.5">✓</span>
                )}
                Variants
              </button>

              {/* Include Expansions - Chip Style */}
              <button
                onClick={() =>
                  onPendingIncludeExpansionsChange(
                    !state.pending.includeExpansions
                  )
                }
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                  state.pending.includeExpansions
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                    : "bg-background text-gray-700 border-gray-300 hover:border-primary/50 hover:bg-gray-50"
                }`}
              >
                {state.pending.includeExpansions && (
                  <span className="mr-1.5">✓</span>
                )}
                Expansions
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Sorting & Actions */}
        <div className="border-t flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-4">
          {/* Left: Sort Controls */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Sorting
            </h3>
            <div className="flex flex-wrap items-end gap-3">
              <div className="relative">
                <div className="relative">
                  <select
                    value={state.pending.sortBy}
                    onChange={(e) => onPendingSortByChange(e.target.value)}
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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

              <div className="relative">
                <div className="relative">
                  <select
                    value={state.pending.sortDirection}
                    onChange={(e) =>
                      onPendingSortDirectionChange(
                        e.target.value as "asc" | "desc"
                      )
                    }
                    className="p-2 text-sm border rounded-md bg-background appearance-none pr-8 min-w-[120px]"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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
            </div>
          </div>

          {/* Active Filters Count (optional) */}
          {(state.pending.grades.length > 0 ||
            state.pending.productLines.length > 0 ||
            state.pending.series.length > 0 ||
            state.pending.releaseTypes.length > 0 ||
            state.pending.vendors.length > 0 ||
            state.pending.mobileSuits.length > 0 ||
            state.pending.yearRange.min !== 1980 ||
            state.pending.yearRange.max !== new Date().getFullYear()) && (
            <div className="text-xs text-gray-500">
              {state.pending.grades.length +
                state.pending.productLines.length +
                state.pending.series.length +
                state.pending.releaseTypes.length +
                state.pending.vendors.length +
                state.pending.mobileSuits.length +
                (state.pending.yearRange.min !== 1980 ||
                state.pending.yearRange.max !== new Date().getFullYear()
                  ? 1
                  : 0)}{" "}
              {state.pending.grades.length +
                state.pending.productLines.length +
                state.pending.series.length +
                state.pending.releaseTypes.length +
                state.pending.vendors.length +
                state.pending.mobileSuits.length +
                (state.pending.yearRange.min !== 1980 ||
                state.pending.yearRange.max !== new Date().getFullYear()
                  ? 1
                  : 0) ===
              1
                ? "filter"
                : "filters"}{" "}
              selected
            </div>
          )}

          {/* Right: Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={onClearAllFilters}
              size="sm"
              className="h-9"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear All
            </Button>
            <Button onClick={onApplyFilters} size="sm" className="h-9">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
