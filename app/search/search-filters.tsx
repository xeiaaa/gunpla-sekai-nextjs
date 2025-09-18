"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { getFilterOptions } from "@/lib/actions/meilisearch";

interface SearchFiltersProps {
  filters: {
    timeline: string;
    grade: string;
    sortBy: string;
  };
  onFilterChange: (filters: Partial<SearchFiltersProps['filters']>) => void;
}

// Default filter options (fallback)
const DEFAULT_TIMELINES = [
  { value: "all", label: "All Timelines" },
  { value: "universal-century", label: "Universal Century" },
  { value: "after-colony", label: "After Colony" },
  { value: "cosmic-era", label: "Cosmic Era" },
  { value: "anno-domini", label: "Anno Domini" },
  { value: "advanced-generation", label: "Advanced Generation" },
  { value: "regild-century", label: "Regild Century" },
  { value: "post-disaster", label: "Post Disaster" },
  { value: "ad-stella", label: "Ad Stella" }
];

const DEFAULT_GRADES = [
  { value: "all", label: "All Grades" },
  { value: "hg", label: "HG (High Grade)" },
  { value: "rg", label: "RG (Real Grade)" },
  { value: "mg", label: "MG (Master Grade)" },
  { value: "pg", label: "PG (Perfect Grade)" },
  { value: "sd", label: "SD (Super Deformed)" },
  { value: "mega", label: "MEGA SIZE" },
  { value: "entry", label: "Entry Grade" }
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "release-desc", label: "Newest First" },
  { value: "release-asc", label: "Oldest First" },
  { value: "price-asc", label: "Price (Low to High)" },
  { value: "price-desc", label: "Price (High to Low)" }
];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [timelines, setTimelines] = useState(DEFAULT_TIMELINES);
  const [grades, setGrades] = useState(DEFAULT_GRADES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load filter options from Meilisearch
    getFilterOptions().then((options) => {
      setTimelines(options.timelines);
      setGrades(options.grades);
      setLoading(false);
    }).catch(() => {
      // Keep default options if Meilisearch fails
      setLoading(false);
    });
  }, []);

  const hasActiveFilters = filters.timeline !== "all" || filters.grade !== "all" || filters.sortBy !== "relevance";

  const clearFilters = () => {
    onFilterChange({
      timeline: "all",
      grade: "all",
      sortBy: "relevance"
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
              <button
                onClick={clearFilters}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.timeline !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {timelines.find(t => t.value === filters.timeline)?.label}
                  <button
                    onClick={() => onFilterChange({ timeline: "all" })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.grade !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  {grades.find(g => g.value === filters.grade)?.label}
                  <button
                    onClick={() => onFilterChange({ grade: "all" })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.sortBy !== "relevance" && (
                <Badge variant="secondary" className="text-xs">
                  {SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label}
                  <button
                    onClick={() => onFilterChange({ sortBy: "relevance" })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.timeline}
            onValueChange={(value) => onFilterChange({ timeline: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timeline" />
            </SelectTrigger>
            <SelectContent>
              {timelines.map((timeline, index) => (
                <SelectItem key={`${timeline.value}-${index}`} value={timeline.value}>
                  {timeline.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grade Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Grade</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.grade}
            onValueChange={(value) => onFilterChange({ grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade, index) => (
                <SelectItem key={`${grade.value}-${index}`} value={grade.value}>
                  {grade.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Sort By</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => onFilterChange({ sortBy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
