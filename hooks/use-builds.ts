import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";

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

// Hook for user builds with infinite scroll
export function useUserBuildsInfinite(
  userId: string,
  options?: {
    status?: string;
    sort?: string;
    limit?: number;
  }
) {
  const { status, sort = "newest", limit = 20 } = options || {};

  return useInfiniteQuery({
    queryKey: ["user", "builds", userId, { status, sort }],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * limit;
      const response = await fetch(
        `/api/builds/user/${userId}?limit=${limit}&offset=${offset}${
          status ? `&status=${status}` : ""
        }&sort=${sort}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user builds");
      }
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!userId,
  });
}

// Hook for all builds with infinite scroll (global feed)
export function useAllBuildsInfinite(options?: {
  status?: string;
  sort?: string;
  limit?: number;
}) {
  const { status, sort = "newest", limit = 20 } = options || {};

  return useInfiniteQuery({
    queryKey: ["all", "builds", { status, sort }],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * limit;
      const response = await fetch(
        `/api/builds/all?limit=${limit}&offset=${offset}${
          status ? `&status=${status}` : ""
        }&sort=${sort}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch all builds");
      }
      return response.json();
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
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

  const invalidateUserBuildQueries = (userId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["user", "builds", userId],
    });
  };

  const invalidateAllBuildQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["all", "builds"],
    });
  };

  return {
    invalidateBuildQueries,
    invalidateUserBuildQueries,
    invalidateAllBuildQueries,
  };
}
