import { useQuery } from "@tanstack/react-query";
import {
  getFilteredKitsWithMeilisearch,
  getFilterDataWithMeilisearch,
} from "@/lib/actions/meilisearch-kits";

interface Kit {
  id: string;
  name: string;
  slug?: string | null;
  number: string;
  variant?: string | null;
  releaseDate?: Date | null;
  priceYen?: number | null;
  boxArt?: string | null;
  baseKitId?: string | null;
  grade?: string | null;
  productLine?: string | null;
  series?: string | null;
  releaseType?: string | null;
  mobileSuits: string[];
}

interface FilterData {
  grades: Array<{ id: string; name: string; slug: string | null }>;
  productLines: Array<{ id: string; name: string; slug: string | null }>;
  mobileSuits: Array<{ id: string; name: string; slug: string | null }>;
  series: Array<{ id: string; name: string; slug: string | null }>;
  releaseTypes: Array<{ id: string; name: string; slug: string | null }>;
}

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
    ],
    queryFn: () => getFilteredKitsWithMeilisearch(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled, but we'll handle loading states
  });
}
