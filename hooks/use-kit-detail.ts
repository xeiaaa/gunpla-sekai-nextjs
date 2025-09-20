import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getKitBySlug } from "@/lib/actions/kits";
import { getKitCollectionStatus } from "@/lib/actions/collections";
import { isCurrentUserAdmin } from "@/lib/actions/users";

// Hook for kit overview data (10 minutes stale time)
export function useKitDetail(slug: string) {
  return useQuery({
    queryKey: ["kit", "detail", slug],
    queryFn: () => getKitBySlug(slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!slug,
  });
}

// Hook for kit collection status (10 minutes stale time)
export function useKitCollectionStatus(kitId: string) {
  return useQuery({
    queryKey: ["kit", "collection", kitId],
    queryFn: () => getKitCollectionStatus(kitId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!kitId,
  });
}

// Hook for admin status (10 minutes stale time)
export function useIsAdmin() {
  return useQuery({
    queryKey: ["user", "admin"],
    queryFn: isCurrentUserAdmin,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for kit reviews (1-2 minutes stale time)
export function useKitReviews(kitId: string) {
  return useQuery({
    queryKey: ["kit", "reviews", kitId],
    queryFn: async () => {
      // This would be implemented based on your review fetching logic
      // For now, returning empty array as placeholder
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId,
  });
}

// Hook for kit builds (1-2 minutes stale time)
export function useKitBuilds(kitId: string) {
  return useQuery({
    queryKey: ["kit", "builds", kitId],
    queryFn: async () => {
      // This would be implemented based on your builds fetching logic
      // For now, returning empty array as placeholder
      return [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId,
  });
}

// Utility function to invalidate kit-related queries
export function useInvalidateKitQueries() {
  const queryClient = useQueryClient();

  const invalidateKitQueries = (kitId: string, slug: string) => {
    // Invalidate kit detail
    queryClient.invalidateQueries({
      queryKey: ["kit", "detail", slug],
    });

    // Invalidate collection status
    queryClient.invalidateQueries({
      queryKey: ["kit", "collection", kitId],
    });

    // Invalidate reviews (shorter stale time)
    queryClient.invalidateQueries({
      queryKey: ["kit", "reviews", kitId],
    });

    // Invalidate builds (shorter stale time)
    queryClient.invalidateQueries({
      queryKey: ["kit", "builds", kitId],
    });
  };

  return { invalidateKitQueries };
}
