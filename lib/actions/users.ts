"use server";

import { prisma } from "@/lib/prisma";
import { CollectionStatus } from "@/generated/prisma";

export interface UserProfileData {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  avatarUrl: string | null;
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
  }>;
}

export async function getUserByUsername(username: string): Promise<UserProfileData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        collections: {
          select: {
            status: true,
          },
        },
        builds: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            kit: {
              select: {
                id: true,
                name: true,
                slug: true,
                boxArt: true,
                productLine: {
                  select: {
                    name: true,
                    grade: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            featuredImage: {
              select: {
                url: true,
              },
            },
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

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      collectionStats,
      recentBuilds: user.builds.map((build) => ({
        id: build.id,
        title: build.title,
        status: build.status,
        createdAt: build.createdAt,
        completedAt: build.completedAt,
        featuredImage: build.featuredImage,
        kit: build.kit,
      })),
      recentReviews: await Promise.all(
        user.reviews.map(async (review) => {
          // Get feedback counts for this review
          const feedbackCounts = await prisma.reviewFeedback.groupBy({
            by: ["isHelpful"],
            where: { reviewId: review.id },
            _count: {
              isHelpful: true,
            },
          });

          const helpfulCount = feedbackCounts.find(f => f.isHelpful)?._count.isHelpful || 0;
          const notHelpfulCount = feedbackCounts.find(f => !f.isHelpful)?._count.isHelpful || 0;

          return {
            id: review.id,
            title: review.title,
            content: review.content,
            overallScore: review.overallScore,
            createdAt: review.createdAt,
            kit: review.kit,
            feedback: {
              helpful: helpfulCount,
              notHelpful: notHelpfulCount,
            },
          };
        })
      ),
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
