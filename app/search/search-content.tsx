"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { SearchFilters } from "./search-filters";
import { SearchResults } from "./search-results";
import { SearchEmptyState } from "./search-empty-state";
import { SearchSuggestions } from "./search-suggestions";
import { searchKitsAndMobileSuitsWithMeilisearch } from "@/lib/actions/meilisearch";

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

  // Real database search function
  const performSearch = async (searchQuery: string, searchFilters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      const searchResults = await searchKitsAndMobileSuitsWithMeilisearch(searchQuery, searchFilters);

      // Transform the results to match the KitCard and MobileSuitCard interfaces
      const transformedKits = searchResults.kits.map(kit => ({
        id: kit.id,
        name: kit.name,
        slug: kit.slug,
        number: kit.number,
        variant: kit.variant,
        releaseDate: kit.releaseDate,
        priceYen: kit.priceYen,
        boxArt: kit.boxArt,
        grade: kit.grade,
        productLine: kit.productLine,
        series: kit.series,
        releaseType: kit.releaseType,
        mobileSuits: kit.mobileSuits
      }));

      const transformedMobileSuits = searchResults.mobileSuits.map(ms => ({
        id: ms.id,
        name: ms.name,
        slug: ms.slug,
        description: ms.description,
        kitsCount: ms.kitsCount,
        scrapedImages: ms.scrapedImages
      }));

      setResults({
        kits: transformedKits,
        mobileSuits: transformedMobileSuits,
        totalKits: searchResults.totalKits,
        totalMobileSuits: searchResults.totalMobileSuits,
        hasMore: searchResults.hasMore
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
