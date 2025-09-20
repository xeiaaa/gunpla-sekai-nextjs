import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKitReviews,
  getUserKitReview,
  getKitReviewStats,
  deleteReview,
} from "@/lib/actions/reviews";
import { ReviewWithDetails, ReviewStats } from "@/lib/types/reviews";

// Hook for kit reviews (1-2 minutes stale time)
export function useKitReviews(kitId: string) {
  return useQuery({
    queryKey: ["kit", "reviews", kitId],
    queryFn: () => getKitReviews(kitId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId,
  });
}

// Hook for user's review of a kit
export function useUserKitReview(kitId: string, userId: string | null) {
  return useQuery({
    queryKey: ["kit", "user-review", kitId, userId],
    queryFn: () => getUserKitReview(kitId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId && !!userId,
  });
}

// Hook for kit review stats
export function useKitReviewStats(kitId: string) {
  return useQuery({
    queryKey: ["kit", "review-stats", kitId],
    queryFn: () => getKitReviewStats(kitId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId,
  });
}

// Hook for deleting a review
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: (_, reviewId) => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({
        queryKey: ["kit", "reviews"],
      });
      queryClient.invalidateQueries({
        queryKey: ["kit", "user-review"],
      });
      queryClient.invalidateQueries({
        queryKey: ["kit", "review-stats"],
      });
    },
  });
}

// Utility function to invalidate review queries
export function useInvalidateReviewQueries() {
  const queryClient = useQueryClient();

  const invalidateReviewQueries = (kitId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["kit", "reviews", kitId],
    });
    queryClient.invalidateQueries({
      queryKey: ["kit", "user-review", kitId],
    });
    queryClient.invalidateQueries({
      queryKey: ["kit", "review-stats", kitId],
    });
  };

  return { invalidateReviewQueries };
}
