import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getFilteredKitsWithMeilisearch } from "@/lib/actions/meilisearch-kits";

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
  yearRange?: { min: number; max: number };
}

// Function to fetch filter data from individual API endpoints
async function getFilterDataFromAPI() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const [vendorsRes, productLinesRes, gradesRes, seriesRes, releaseTypesRes] =
    await Promise.all([
      fetch(`${apiUrl}/vendors?select=id,slug,name&limit=100&sort=name:asc`),
      fetch(
        `${apiUrl}/product-lines?select=id,slug,name&limit=100&sort=name:asc`
      ),
      fetch(`${apiUrl}/grades?select=id,slug,name&limit=100&sort=name:asc`),
      fetch(`${apiUrl}/series?select=id,slug,name&limit=200&sort=name:asc`),
      fetch(
        `${apiUrl}/release-types?select=id,slug,name&limit=100&sort=name:asc`
      ),
    ]);

  if (
    !vendorsRes.ok ||
    !productLinesRes.ok ||
    !gradesRes.ok ||
    !seriesRes.ok ||
    !releaseTypesRes.ok
  ) {
    throw new Error("Failed to fetch filter data");
  }

  const [vendors, productLines, grades, series, releaseTypes] =
    await Promise.all([
      vendorsRes.json(),
      productLinesRes.json(),
      gradesRes.json(),
      seriesRes.json(),
      releaseTypesRes.json(),
    ]);

  return {
    vendors: vendors.items || [],
    productLines: productLines.items || [],
    grades: grades.items || [],
    series: series.items || [],
    releaseTypes: releaseTypes.items || [],
  };
}

// Hook for filter data
export function useFilterData() {
  return useQuery({
    queryKey: ["filterData"],
    queryFn: getFilterDataFromAPI,
    staleTime: 60 * 60 * 1000, // 1 hour - consistent with provider default
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - consistent with provider default
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
    staleTime: 60 * 60 * 1000, // 1 hour - consistent with provider default
    gcTime: 24 * 60 * 60 * 1000, // 24 hours - consistent with provider default
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
      params.yearRange,
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
    staleTime: 5 * 60 * 1000, // 5 minutes - shorter for better UX during filtering
    gcTime: 30 * 60 * 1000, // 30 minutes - shorter to prevent memory issues
    initialPageParam: 0,
    // Keep previous data while loading new data to prevent flickering
    // placeholderData: (previousData) => previousData,
  });
}
