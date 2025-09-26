import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";

interface BuildLikesData {
  likes: number;
  liked: boolean;
}

export function useBuildLikes(buildId: string) {
  const { userId } = useAuth();

  return useQuery({
    queryKey: ["build-likes", buildId],
    queryFn: async (): Promise<BuildLikesData> => {
      const response = await fetch(`/api/builds/${buildId}/like`);
      if (!response.ok) {
        throw new Error("Failed to fetch likes");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!buildId,
  });
}

export function useToggleBuildLike(buildId: string) {
  const queryClient = useQueryClient();
  const { userId } = useAuth();

  return useMutation({
    mutationFn: async (liked: boolean): Promise<BuildLikesData> => {
      const response = await fetch(`/api/builds/${buildId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ liked }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      return response.json();
    },
    onMutate: async (liked: boolean) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["build-likes", buildId] });

      // Snapshot the previous value
      const previousLikes = queryClient.getQueryData<BuildLikesData>([
        "build-likes",
        buildId,
      ]);

      // Optimistically update to the new value
      if (previousLikes) {
        queryClient.setQueryData<BuildLikesData>(["build-likes", buildId], {
          likes: liked ? previousLikes.likes + 1 : previousLikes.likes - 1,
          liked,
        });
      }

      // Return a context object with the snapshotted value
      return { previousLikes };
    },
    onError: (err, liked, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousLikes) {
        queryClient.setQueryData(
          ["build-likes", buildId],
          context.previousLikes
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["build-likes", buildId] });
    },
  });
}
