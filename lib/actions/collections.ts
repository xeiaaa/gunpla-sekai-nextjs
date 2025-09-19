"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CollectionStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function addToCollection(
  kitId: string,
  status: CollectionStatus
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to add to collection");
  }

  try {
    // Check if kit exists
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    if (!kit) {
      throw new Error("Kit not found");
    }

    // Upsert collection entry (update if exists, create if not)
    const collection = await prisma.userKitCollection.upsert({
      where: {
        userId_kitId: {
          userId,
          kitId,
        },
      },
      update: {
        status,
        updatedAt: new Date(),
      },
      create: {
        userId,
        kitId,
        status,
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");

    return { success: true, collection };
  } catch (error) {
    console.error("Error adding to collection:", error);
    throw new Error("Failed to add to collection");
  }
}

export async function removeFromCollection(kitId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to remove from collection");
  }

  try {
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    if (!kit) {
      throw new Error("Kit not found");
    }

    await prisma.userKitCollection.delete({
      where: {
        userId_kitId: {
          userId,
          kitId,
        },
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");

    return { success: true };
  } catch (error) {
    console.error("Error removing from collection:", error);
    throw new Error("Failed to remove from collection");
  }
}

export async function updateCollectionStatus(
  kitId: string,
  status: CollectionStatus
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to update collection");
  }

  try {
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    if (!kit) {
      throw new Error("Kit not found");
    }

    const collection = await prisma.userKitCollection.update({
      where: {
        userId_kitId: {
          userId,
          kitId,
        },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");

    return { success: true, collection };
  } catch (error) {
    console.error("Error updating collection:", error);
    throw new Error("Failed to update collection");
  }
}

export async function getUserCollection(status?: CollectionStatus) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const collections = await prisma.userKitCollection.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            releaseType: true,
            mobileSuits: {
              include: {
                mobileSuit: {
                  include: {
                    series: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });

    return collections;
  } catch (error) {
    console.error("Error fetching user collection:", error);
    return [];
  }
}

export async function getKitCollectionStatus(kitId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const collection = await prisma.userKitCollection.findUnique({
      where: {
        userId_kitId: {
          userId,
          kitId,
        },
      },
    });

    return collection?.status || null;
  } catch (error) {
    console.error("Error fetching kit collection status:", error);
    return null;
  }
}

export async function getUserCollectionByUsername(username: string, status?: CollectionStatus) {
  try {
    // First get the user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    const collections = await prisma.userKitCollection.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      include: {
        kit: {
          include: {
            productLine: {
              include: {
                grade: true,
              },
            },
            releaseType: true,
            mobileSuits: {
              include: {
                mobileSuit: {
                  include: {
                    series: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: "desc",
      },
    });

    return collections;
  } catch (error) {
    console.error("Error fetching user collection by username:", error);
    return [];
  }
}
