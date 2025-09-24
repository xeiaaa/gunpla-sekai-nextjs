import { useQuery } from "@tanstack/react-query";
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
    staleTime: 0, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days in cache
  });
}

// Hook for filtered kits
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
    staleTime: 0, // 5 minutes
    enabled: true, // Always enabled, but we'll handle loading states
  });
}
