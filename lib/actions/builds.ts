"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { BuildStatus } from "../../generated/prisma";
import type { Prisma } from "../../generated/prisma";

export interface CreateBuildData {
  kitId: string;
  title: string;
  description?: string;
  status?: BuildStatus;
}

export interface UpdateBuildData {
  title?: string;
  description?: string;
  status?: BuildStatus;
  startedAt?: Date | null;
  completedAt?: Date | null;
  featuredImageId?: string | null;
}

export async function createBuild(data: CreateBuildData) {
  const { userId } = await auth();
  console.log("Auth result for build creation:", { userId });

  if (!userId) {
    console.error("No userId found in auth for build creation");
    throw new Error("Unauthorized");
  }

  try {
    console.log("Creating build with data:", { userId, ...data });

    const build = await prisma.build.create({
      data: {
        userId,
        kitId: data.kitId,
        title: data.title,
        description: data.description,
        status: data.status || "PLANNING",
      },
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            series: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${build.kit.slug}`);
    return build;
  } catch (error) {
    console.error("Error creating build:", error);
    throw new Error("Failed to create build");
  }
}

export async function updateBuild(buildId: string, data: UpdateBuildData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const build = await prisma.build.update({
      where: {
        id: buildId,
        userId, // Ensure user can only update their own builds
      },
      data,
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            series: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${build.kit.slug}`);
    revalidatePath(`/builds/${buildId}`);
    revalidatePath(`/builds/${buildId}/edit`);
    return build;
  } catch (error) {
    console.error("Error updating build:", error);
    throw new Error("Failed to update build");
  }
}

export async function deleteBuild(buildId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      select: { kit: { select: { slug: true } } },
    });

    if (!build) {
      throw new Error("Build not found");
    }

    await prisma.build.delete({
      where: {
        id: buildId,
        userId, // Ensure user can only delete their own builds
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${build.kit.slug}`);
    revalidatePath("/builds");
    revalidatePath(`/builds/${buildId}`);
    revalidatePath(`/builds/${buildId}/edit`);
  } catch (error) {
    console.error("Error deleting build:", error);
    throw new Error("Failed to delete build");
  }
}

export async function getBuild(buildId: string, userId?: string) {
  try {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            series: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: true,
        milestones: {
          orderBy: { order: "asc" },
          include: {
            uploads: {
              include: {
                upload: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!build) {
      return null;
    }

    // Get user's like status if userId is provided
    let userLiked = false;
    if (userId) {
      const userLike = await prisma.buildLike.findUnique({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
      });
      userLiked = !!userLike;
    }

    return {
      ...build,
      likes: build._count.likes,
      liked: userLiked,
      comments: build._count.comments,
    };
  } catch (error) {
    console.error("Error fetching build:", error);
    throw new Error("Failed to fetch build");
  }
}

export async function getBuildsByKit(kitId: string, limit: number = 10) {
  try {
    const builds = await prisma.build.findMany({
      where: { kitId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: true,
        milestones: {
          take: 1,
          orderBy: { order: "asc" },
          include: {
            uploads: {
              take: 1,
              include: {
                upload: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    return builds;
  } catch (error) {
    console.error("Error fetching builds by kit:", error);
    throw new Error("Failed to fetch builds");
  }
}

export async function getRecentBuilds(limit: number = 10) {
  try {
    const builds = await prisma.build.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        kit: {
          select: {
            id: true,
            name: true,
            slug: true,
            boxArt: true,
            productLine: {
              include: {
                grade: true,
              },
            },
            series: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: true,
        milestones: {
          take: 1,
          orderBy: { order: "asc" },
          include: {
            uploads: {
              take: 1,
              include: {
                upload: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    return builds;
  } catch (error) {
    console.error("Error fetching recent builds:", error);
    throw new Error("Failed to fetch recent builds");
  }
}

export async function getUserBuilds(
  userId: string,
  limit: number = 20,
  status?: string,
  sort: string = "newest"
) {
  try {
    // Build where clause
    const where: Prisma.BuildWhereInput = { userId };
    if (status) {
      where.status = status as BuildStatus;
    }

    // Build orderBy clause
    let orderBy: Prisma.BuildOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "completed":
        orderBy = { completedAt: "desc" };
        break;
      case "status":
        orderBy = { status: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const builds = await prisma.build.findMany({
      where,
      take: limit,
      orderBy,
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            series: true,
          },
        },
        featuredImage: true,
        milestones: {
          orderBy: { order: "asc" },
          include: {
            uploads: {
              include: {
                upload: true,
              },
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
          },
        },
      },
    });

    return builds;
  } catch (error) {
    console.error("Error fetching user builds:", error);
    throw new Error("Failed to fetch user builds");
  }
}

export async function getBuildLikes(buildId: string, userId?: string) {
  try {
    const [likeCount, userLike] = await Promise.all([
      prisma.buildLike.count({
        where: { buildId },
      }),
      userId
        ? prisma.buildLike.findUnique({
            where: {
              buildId_userId: {
                buildId,
                userId,
              },
            },
          })
        : null,
    ]);

    return {
      likes: likeCount,
      liked: !!userLike,
    };
  } catch (error) {
    console.error("Error fetching build likes:", error);
    throw new Error("Failed to fetch build likes");
  }
}

// Optimized function for edit pages - only loads essential data
export async function getBuildForEdit(buildId: string, userId?: string) {
  try {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        startedAt: true,
        completedAt: true,
        kit: {
          select: {
            id: true,
            name: true,
            number: true,
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
            series: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            eagerUrl: true,
          },
        },
        featuredImageId: true,
        milestones: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            order: true,
            buildId: true,
            completedAt: true,
            uploads: {
              select: {
                id: true,
                caption: true,
                order: true,
                upload: {
                  select: {
                    id: true,
                    url: true,
                    eagerUrl: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!build) {
      return null;
    }

    // Get user's like status if userId is provided
    let userLiked = false;
    if (userId) {
      const userLike = await prisma.buildLike.findUnique({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
      });
      userLiked = !!userLike;
    }

    return {
      ...build,
      likes: build._count.likes,
      liked: userLiked,
      comments: build._count.comments,
    };
  } catch (error) {
    console.error("Error fetching build for edit:", error);
    throw new Error("Failed to fetch build for edit");
  }
}

// Optimized function for user builds pages - minimal data for cards
export async function getUserBuildsOptimized(
  userId: string,
  limit: number = 20,
  status?: string,
  sort: string = "newest"
) {
  try {
    // Build where clause
    const where: Prisma.BuildWhereInput = { userId };
    if (status) {
      where.status = status as BuildStatus;
    }

    // Build orderBy clause
    let orderBy: Prisma.BuildOrderByWithRelationInput = { createdAt: "desc" };
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "completed":
        orderBy = { completedAt: "desc" };
        break;
      case "status":
        orderBy = { status: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const builds = await prisma.build.findMany({
      where,
      take: limit,
      orderBy,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        completedAt: true,
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
            series: {
              select: {
                name: true,
              },
            },
          },
        },
        featuredImage: {
          select: {
            url: true,
          },
        },
        milestones: {
          select: {
            id: true,
            type: true,
            title: true,
            order: true,
            uploads: {
              select: {
                upload: {
                  select: {
                    url: true,
                  },
                },
              },
              take: 3, // Only first 3 images per milestone
              orderBy: { order: "asc" },
            },
          },
          take: 5, // Only first 5 milestones
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            milestones: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Transform the data to match the expected interface
    const transformedBuilds = builds.map((build) => ({
      ...build,
      milestones: build.milestones.map((milestone) => ({
        ...milestone,
        imageUrls: milestone.uploads.map((upload) => upload.upload.url),
      })),
    }));

    return transformedBuilds;
  } catch (error) {
    console.error("Error fetching optimized user builds:", error);
    throw new Error("Failed to fetch optimized user builds");
  }
}

// Minimal function for ISG - only essential data for initial render
export async function getBuildForStaticGeneration(buildId: string) {
  try {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        featuredImageId: true,
        kit: {
          select: {
            id: true,
            name: true,
            number: true,
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
            series: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            eagerUrl: true,
          },
        },
        uploads: {
          include: {
            upload: {
              select: {
                id: true,
                url: true,
                eagerUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            milestones: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!build) {
      return null;
    }

    return {
      ...build,
      likes: build._count.likes,
      comments: build._count.comments,
    };
  } catch (error) {
    console.error("Error fetching build for static generation:", error);
    throw new Error("Failed to fetch build for static generation");
  }
}

// Function to get milestones separately (for client-side loading)
export async function getBuildMilestones(
  buildId: string,
  limit: number = 5,
  offset: number = 0
) {
  try {
    const milestones = await prisma.buildMilestone.findMany({
      where: { buildId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        completedAt: true,
        order: true,
        uploads: {
          select: {
            id: true,
            caption: true,
            order: true,
            upload: {
              select: {
                id: true,
                url: true,
                eagerUrl: true,
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
      take: limit,
      skip: offset,
    });

    return milestones;
  } catch (error) {
    console.error("Error fetching build milestones:", error);
    throw new Error("Failed to fetch build milestones");
  }
}

// Optimized function for individual build cards (public view)
export async function getBuildForCard(buildId: string, userId?: string) {
  try {
    const build = await prisma.build.findUnique({
      where: { id: buildId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        featuredImageId: true,
        kit: {
          select: {
            id: true,
            name: true,
            number: true,
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
            series: {
              select: {
                name: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            url: true,
            eagerUrl: true,
          },
        },
        milestones: {
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            completedAt: true,
            order: true,
            uploads: {
              select: {
                id: true,
                caption: true,
                order: true,
                upload: {
                  select: {
                    id: true,
                    url: true,
                    eagerUrl: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            milestones: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!build) {
      return null;
    }

    // Get user's like status if userId is provided
    let userLiked = false;
    if (userId) {
      const userLike = await prisma.buildLike.findUnique({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
      });
      userLiked = !!userLike;
    }

    return {
      ...build,
      likes: build._count.likes,
      liked: userLiked,
      comments: build._count.comments,
    };
  } catch (error) {
    console.error("Error fetching build for card:", error);
    throw new Error("Failed to fetch build for card");
  }
}

export async function toggleBuildLike(buildId: string, liked: boolean) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    if (liked) {
      // Add like (upsert to handle race conditions)
      await prisma.buildLike.upsert({
        where: {
          buildId_userId: {
            buildId,
            userId,
          },
        },
        update: {},
        create: {
          buildId,
          userId,
        },
      });
    } else {
      // Remove like
      await prisma.buildLike.deleteMany({
        where: {
          buildId,
          userId,
        },
      });
    }

    // Get updated like count
    const likeCount = await prisma.buildLike.count({
      where: { buildId },
    });

    return {
      likes: likeCount,
      liked,
    };
  } catch (error) {
    console.error("Error toggling build like:", error);
    throw new Error("Failed to toggle build like");
  }
}

// Comment-related actions
export async function createBuildComment(buildId: string, content: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  try {
    const comment = await prisma.buildComment.create({
      data: {
        buildId,
        userId,
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    revalidatePath(`/builds/${buildId}`);
    return comment;
  } catch (error) {
    console.error("Error creating build comment:", error);
    throw new Error("Failed to create comment");
  }
}

export async function getBuildComments(buildId: string) {
  try {
    const comments = await prisma.buildComment.findMany({
      where: { buildId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    return comments;
  } catch (error) {
    console.error("Error fetching build comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function deleteBuildComment(commentId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // First check if the comment exists and belongs to the user
    const comment = await prisma.buildComment.findUnique({
      where: { id: commentId },
      select: { userId: true, buildId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("Unauthorized to delete this comment");
    }

    await prisma.buildComment.delete({
      where: { id: commentId },
    });

    revalidatePath(`/builds/${comment.buildId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting build comment:", error);
    throw new Error("Failed to delete comment");
  }
}

export async function updateBuildComment(commentId: string, content: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  if (!content.trim()) {
    throw new Error("Comment content cannot be empty");
  }

  try {
    // First check if the comment exists and belongs to the user
    const existingComment = await prisma.buildComment.findUnique({
      where: { id: commentId },
      select: { userId: true, buildId: true },
    });

    if (!existingComment) {
      throw new Error("Comment not found");
    }

    if (existingComment.userId !== userId) {
      throw new Error("Unauthorized to update this comment");
    }

    const comment = await prisma.buildComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    });

    revalidatePath(`/builds/${existingComment.buildId}`);
    return comment;
  } catch (error) {
    console.error("Error updating build comment:", error);
    throw new Error("Failed to update comment");
  }
}
