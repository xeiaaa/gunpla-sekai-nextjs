"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CollectionStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export interface UserProfileData {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  avatarUrl: string | null;
  bio: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  portfolioUrl: string | null;
  bannerImageUrl: string | null;
  createdAt: Date;
  // Collection stats
  collectionStats: {
    wishlist: number;
    preorder: number;
    backlog: number;
    inProgress: number;
    built: number;
    total: number;
  };
  // Recent builds (limit 5)
  recentBuilds: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    completedAt: Date | null;
    featuredImage: {
      url: string;
    } | null;
    kit: {
      id: string;
      name: string;
      slug: string | null;
      boxArt: string | null;
      productLine: {
        name: string;
        grade: {
          name: string;
        };
      } | null;
    };
    likes?: {
      count: number;
    };
    comments?: {
      count: number;
    };
    uploads?: Array<{
      id: string;
      url: string;
    }>;
    milestones?: Array<{
      id: string;
      type: string;
      title: string;
      imageUrls: string[];
      uploads: Array<{
        upload: {
          url: string;
        };
      }>;
    }>;
  }>;
  // Recent reviews (limit 5)
  recentReviews: Array<{
    id: string;
    title: string | null;
    content: string | null;
    overallScore: number;
    createdAt: Date;
    kit: {
      id: string;
      name: string;
      slug: string | null;
      boxArt: string | null;
    };
    feedback?: {
      helpful: number;
      notHelpful: number;
    };
    categoryScores?: Array<{
      category: string;
      score: number;
      notes: string | null;
    }>;
  }>;
}

export async function getUserByUsername(
  username: string
): Promise<UserProfileData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        collections: {
          select: {
            status: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            kit: {
              select: {
                id: true,
                name: true,
                slug: true,
                boxArt: true,
              },
            },
            feedback: {
              select: {
                isHelpful: true,
              },
            },
            categoryScores: {
              select: {
                category: true,
                score: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate collection stats
    const collectionStats = {
      wishlist: 0,
      preorder: 0,
      backlog: 0,
      inProgress: 0,
      built: 0,
      total: user.collections.length,
    };

    user.collections.forEach((collection) => {
      switch (collection.status) {
        case CollectionStatus.WISHLIST:
          collectionStats.wishlist++;
          break;
        case CollectionStatus.PREORDER:
          collectionStats.preorder++;
          break;
        case CollectionStatus.BACKLOG:
          collectionStats.backlog++;
          break;
        case CollectionStatus.IN_PROGRESS:
          collectionStats.inProgress++;
          break;
        case CollectionStatus.BUILT:
          collectionStats.built++;
          break;
      }
    });

    // Get all review feedback counts in a single query to avoid N+1 problem
    const reviewIds = user.reviews.map((review) => review.id);
    const allFeedbackCounts =
      reviewIds.length > 0
        ? await prisma.reviewFeedback.groupBy({
            by: ["reviewId", "isHelpful"],
            where: {
              reviewId: { in: reviewIds },
            },
            _count: {
              isHelpful: true,
            },
          })
        : [];

    // Create a map for quick lookup
    const feedbackMap = new Map<
      string,
      { helpful: number; notHelpful: number }
    >();
    allFeedbackCounts.forEach((feedback) => {
      const key = feedback.reviewId;
      if (!feedbackMap.has(key)) {
        feedbackMap.set(key, { helpful: 0, notHelpful: 0 });
      }
      const counts = feedbackMap.get(key)!;
      if (feedback.isHelpful) {
        counts.helpful = feedback._count.isHelpful;
      } else {
        counts.notHelpful = feedback._count.isHelpful;
      }
    });

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      portfolioUrl: user.portfolioUrl,
      bannerImageUrl: user.bannerImageUrl,
      createdAt: user.createdAt,
      collectionStats,
      recentBuilds: [], // No builds data for public profiles
      recentReviews: user.reviews.map((review) => {
        const feedback = feedbackMap.get(review.id) || {
          helpful: 0,
          notHelpful: 0,
        };

        return {
          id: review.id,
          title: review.title,
          content: review.content,
          overallScore: review.overallScore,
          createdAt: review.createdAt,
          kit: review.kit,
          feedback: {
            helpful: feedback.helpful,
            notHelpful: feedback.notHelpful,
          },
          categoryScores: review.categoryScores.map((score) => ({
            category: score.category,
            score: score.score,
            notes: score.notes,
          })),
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching user by username:", error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        avatarUrl: true,
        createdAt: true,
        // Gunpla Sekai specific fields
        bio: true,
        instagramUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        portfolioUrl: true,
        bannerImageUrl: true,
        themeColor: true,
        isPublic: true,
        showCollections: true,
        showBuilds: true,
        showActivity: true,
        showBadges: true,
        emailNotifications: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

// Optimized function for basic user info (metadata generation)
export async function getUserBasicInfo(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching user basic info:", error);
    return null;
  }
}

// Optimized function to get full profile by userId (for /me page)
export async function getUserProfileById(
  userId: string
): Promise<UserProfileData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        collections: {
          select: {
            status: true,
          },
        },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            kit: {
              select: {
                id: true,
                name: true,
                slug: true,
                boxArt: true,
              },
            },
            feedback: {
              select: {
                isHelpful: true,
              },
            },
            categoryScores: {
              select: {
                category: true,
                score: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate collection stats
    const collectionStats = {
      wishlist: 0,
      preorder: 0,
      backlog: 0,
      inProgress: 0,
      built: 0,
      total: user.collections.length,
    };

    user.collections.forEach((collection) => {
      switch (collection.status) {
        case CollectionStatus.WISHLIST:
          collectionStats.wishlist++;
          break;
        case CollectionStatus.PREORDER:
          collectionStats.preorder++;
          break;
        case CollectionStatus.BACKLOG:
          collectionStats.backlog++;
          break;
        case CollectionStatus.IN_PROGRESS:
          collectionStats.inProgress++;
          break;
        case CollectionStatus.BUILT:
          collectionStats.built++;
          break;
      }
    });

    // Get all review feedback counts in a single query to avoid N+1 problem
    const reviewIds = user.reviews.map((review) => review.id);
    const allFeedbackCounts =
      reviewIds.length > 0
        ? await prisma.reviewFeedback.groupBy({
            by: ["reviewId", "isHelpful"],
            where: {
              reviewId: { in: reviewIds },
            },
            _count: {
              isHelpful: true,
            },
          })
        : [];

    // Create a map for quick lookup
    const feedbackMap = new Map<
      string,
      { helpful: number; notHelpful: number }
    >();
    allFeedbackCounts.forEach((feedback) => {
      const key = feedback.reviewId;
      if (!feedbackMap.has(key)) {
        feedbackMap.set(key, { helpful: 0, notHelpful: 0 });
      }
      const counts = feedbackMap.get(key)!;
      if (feedback.isHelpful) {
        counts.helpful = feedback._count.isHelpful;
      } else {
        counts.notHelpful = feedback._count.isHelpful;
      }
    });

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      instagramUrl: user.instagramUrl,
      youtubeUrl: user.youtubeUrl,
      portfolioUrl: user.portfolioUrl,
      bannerImageUrl: user.bannerImageUrl,
      createdAt: user.createdAt,
      collectionStats,
      recentBuilds: [], // No builds data for profile pages
      recentReviews: user.reviews.map((review) => {
        const feedback = feedbackMap.get(review.id) || {
          helpful: 0,
          notHelpful: 0,
        };

        return {
          id: review.id,
          title: review.title,
          content: review.content,
          overallScore: review.overallScore,
          createdAt: review.createdAt,
          kit: review.kit,
          feedback: {
            helpful: feedback.helpful,
            notHelpful: feedback.notHelpful,
          },
          categoryScores: review.categoryScores.map((score) => ({
            category: score.category,
            score: score.score,
            notes: score.notes,
          })),
        };
      }),
    };
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
    return null;
  }
}

export interface UpdateUserData {
  // Gunpla Sekai specific fields
  bio?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  portfolioUrl?: string;
  bannerImageUrl?: string;
  themeColor?: string;
  isPublic?: boolean;
  showCollections?: boolean;
  showBuilds?: boolean;
  showActivity?: boolean;
  showBadges?: boolean;
  emailNotifications?: boolean;
}

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        avatarUrl: true,
        bio: true,
        instagramUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        portfolioUrl: true,
        bannerImageUrl: true,
        themeColor: true,
        isPublic: true,
        showCollections: true,
        showBuilds: true,
        showActivity: true,
        showBadges: true,
        emailNotifications: true,
      },
    });

    // Revalidate the user's public profile page if they have a username
    if (user.username) {
      revalidatePath(`/users/${user.username}`);
    }

    // Also revalidate the settings page
    revalidatePath("/settings/profile");

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      if (error.message.includes("username")) {
        return { success: false, error: "Username is already taken" };
      }
    }

    return { success: false, error: "Failed to update profile" };
  }
}

export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isAdmin: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function isCurrentUserAdmin() {
  try {
    const user = await getCurrentUser();
    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
