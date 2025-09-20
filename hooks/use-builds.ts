import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Build {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  featuredImage: {
    id: string;
    url: string;
    eagerUrl: string | null;
  } | null;
  milestones: Array<{
    uploads: Array<{
      upload: {
        url: string;
        eagerUrl: string | null;
      };
    }>;
  }>;
  _count: {
    milestones: number;
    likes: number;
    comments: number;
  };
}

// Hook for kit builds (1-2 minutes stale time)
export function useKitBuilds(kitId: string) {
  return useQuery({
    queryKey: ["kit", "builds", kitId],
    queryFn: async (): Promise<Build[]> => {
      const response = await fetch(`/api/builds/kit/${kitId}?limit=6`);
      if (!response.ok) {
        throw new Error("Failed to fetch builds");
      }
      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!kitId,
  });
}

// Utility function to invalidate build queries
export function useInvalidateBuildQueries() {
  const queryClient = useQueryClient();

  const invalidateBuildQueries = (kitId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["kit", "builds", kitId],
    });
  };

  return { invalidateBuildQueries };
}
