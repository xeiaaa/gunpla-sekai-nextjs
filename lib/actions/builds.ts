"use server";

import { prisma } from "@/lib/test-utils/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { BuildStatus } from "@prisma/client";

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
  } catch (error) {
    console.error("Error deleting build:", error);
    throw new Error("Failed to delete build");
  }
}

export async function getBuild(buildId: string) {
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
      },
    });

    return build;
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

export async function getUserBuilds(userId: string, limit: number = 20) {
  try {
    const builds = await prisma.build.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
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
