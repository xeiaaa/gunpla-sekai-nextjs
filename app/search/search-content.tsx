"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchFilters } from "./search-filters";
import { SearchResults } from "./search-results";
import { SearchEmptyState } from "./search-empty-state";
import { SearchSuggestions } from "./search-suggestions";
import { searchKitsAndMobileSuitsWithMeilisearch } from "@/lib/actions/meilisearch";
import { getFilteredKitsWithMeilisearch } from "@/lib/actions/meilisearch-kits";

interface SearchFilters {
  timeline: string;
  grade: string;
  sortBy: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [filters, setFilters] = useState<SearchFilters>({
    timeline: "all",
    grade: "all",
    sortBy: "relevance"
  });

  const [results, setResults] = useState({
    kits: [],
    mobileSuits: [],
    totalKits: 0,
    totalMobileSuits: 0,
    hasMore: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search function using the same logic as kits page
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Use the same search logic as the kits page for consistency
      const kitsResult = await getFilteredKitsWithMeilisearch({
        searchTerm: searchQuery,
        sortBy: searchFilters.sortBy === 'relevance' ? 'relevance' : searchFilters.sortBy,
        order: searchFilters.sortBy === 'relevance' ? 'most-relevant' : 'ascending',
        limit: 8, // Limit for search preview
        offset: 0
      });

      // For now, we'll focus on kits only and keep mobile suits search separate
      // TODO: Integrate mobile suits search with the same prioritization logic
      const mobileSuitsResult = await searchKitsAndMobileSuitsWithMeilisearch(searchQuery, searchFilters);

      setResults({
        kits: kitsResult.kits,
        mobileSuits: mobileSuitsResult.mobileSuits,
        totalKits: kitsResult.total,
        totalMobileSuits: mobileSuitsResult.totalMobileSuits,
        hasMore: kitsResult.hasMore || mobileSuitsResult.hasMore
      });
    } catch (err) {
      console.error('Search error:', err);
      setError("Failed to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query, filters);
    }
  }, [query, filters]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">
            Enter a search term to find kits and mobile suits
          </h1>
        </div>
      </div>
    );
  }

  const hasResults = results.kits.length > 0 || results.mobileSuits.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Search Results for &ldquo;{query}&rdquo;
        </h1>
        {hasResults && (
          <p className="text-muted-foreground">
            Found {results.totalKits} kits and {results.totalMobileSuits} mobile suits
          </p>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ) : hasResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <SearchResults
              results={results}
              query={query}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <SearchEmptyState query={query} />
          <SearchSuggestions query={query} />
        </div>
      )}
    </div>
  );
}

export default SearchContent;
