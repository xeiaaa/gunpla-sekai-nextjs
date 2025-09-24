import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import {
  getFilteredKitsWithMeilisearch,
  getFilterDataWithMeilisearch,
} from "@/lib/actions/meilisearch-kits";

interface UseKitsParams {
  gradeIds: string[];
  productLineIds: string[];
  mobileSuitIds: string[];
  seriesIds: string[];
  releaseTypeIds: string[];
  searchTerm: string;
  sortBy: string;
  order: string;
  limit?: number;
  offset?: number;
  includeExpansions?: boolean;
  includeVariants?: boolean;
}

// Hook for filter data
export function useFilterData() {
  return useQuery({
    queryKey: ["filterData"],
    queryFn: getFilterDataWithMeilisearch,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in cache
  });
}

// Hook for filtered kits with pagination
export function useKits(params: UseKitsParams) {
  return useQuery({
    queryKey: [
      "kits",
      params.gradeIds,
      params.productLineIds,
      params.mobileSuitIds,
      params.seriesIds,
      params.releaseTypeIds,
      params.searchTerm,
      params.sortBy,
      params.order,
      params.limit,
      params.offset,
      params.includeExpansions,
      params.includeVariants,
    ],
    queryFn: () => getFilteredKitsWithMeilisearch(params),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: true, // Always enabled, but we'll handle loading states
  });
}

// Hook for infinite scroll kits
export function useKitsInfinite(
  params: Omit<UseKitsParams, "limit" | "offset">
) {
  const pageSize = 20; // Load 20 kits per page

  return useInfiniteQuery({
    queryKey: [
      "kits-infinite",
      params.gradeIds,
      params.productLineIds,
      params.mobileSuitIds,
      params.seriesIds,
      params.releaseTypeIds,
      params.searchTerm,
      params.sortBy,
      params.order,
      params.includeExpansions,
      params.includeVariants,
    ],
    queryFn: ({ pageParam = 0 }) =>
      getFilteredKitsWithMeilisearch({
        ...params,
        limit: pageSize,
        offset: pageParam * pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      // If there are more kits to load, return the next page number
      if (lastPage.hasMore) {
        return allPages.length;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    initialPageParam: 0,
  });
}
