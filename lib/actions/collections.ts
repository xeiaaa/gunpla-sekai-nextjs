"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { apiClient } from "../api-client";

export interface UserCollectionResponse {
  collection: {
    id: string;
    userId: string;
    kitId: string;
    status: string;
    wishlistNotes?: string | null;
    preorderNotes?: string | null;
    backlogNotes?: string | null;
    inProgressNotes?: string | null;
    builtNotes?: string | null;
    wishlistedAt?: string | null;
    preorderedAt?: string | null;
    acquiredAt?: string | null;
    startedAt?: string | null;
    completedAt?: string | null;
    addedAt: string;
    updatedAt: string;
  };
}

export interface UserCollectionsResponse {
  items: UserCollectionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface Kit {
  id: string;
  name: string;
  slug: string;
  number: string;
  variant: string | null;
  releaseDate: string | null;
  priceYen: number;
  region: string | null;
  boxArt: string | null;
  notes: string | null;
  manualLinks: string[];
  scrapedImages: string[];
  potentialBaseKit: string | null;
  isOriginalDesign: boolean;
  featuredScore: number | null;
  createdAt: string;
  updatedAt: string;
  productLineId: string | null;
  seriesId: string | null;
  releaseTypeId: string | null;
  baseKitId: string | null;

  // Related models
  productLine?: Record<string, any> | null;
  series?: Record<string, any> | null;
  releaseType?: Record<string, any> | null;
}


export interface UserCollectionItem {
  id: string;
  userId: string;
  kitId: string;
  status: CollectionStatus;
  price: number;
  wishlistNotes: string | null;
  preorderNotes: string | null;
  backlogNotes: string | null;
  inProgressNotes: string | null;
  builtNotes: string | null;
  wishlistedAt: string | null;
  preorderedAt: string | null;
  acquiredAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  addedAt: string;
  updatedAt: string;
  kit: Kit
}

export enum CollectionStatus {
  WISHLIST = "WISHLIST",
  PREORDER = "PREORDER",
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  BUILT = "BUILT",
}

export async function addToCollection(kitId: string, status: CollectionStatus) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User must be authenticated to add to collection");
  }

  try {
    const kit = await prisma.kit.findUnique({ where: { id: kitId } });
    if (!kit) throw new Error("Kit not found");

    // ✅ Correct generic type + correct argument order
    const data = await apiClient.post<UserCollectionResponse>(
      "/user-collections",
      { kitId, status },
    );

    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");
    revalidatePath(`/users/${userId}`);

    return data; // ✅ Already has "collection"
  } catch (error) {
    console.error("Error adding to collection:", error);
    throw new Error("Failed to add to collection");
  }
}


export async function removeFromCollection(kitId: string) {
  const { userId, } = await auth();

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
    revalidatePath(`/users/${userId}`);

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

    // need to change to getKit
    const kit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    const data = await apiClient.put<UserCollectionResponse>(
      "/user-collections",
      { status },
    );


    revalidatePath("/kits");
    revalidatePath(`/kits/${kit.slug}`);
    revalidatePath("/collections");
    revalidatePath(`/users/${userId}`);

    return data
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

    const response = await apiClient.get<UserCollectionsResponse>(
      `/user-collections?page=1&limit=10&status=${status}`,
    );

    return response.items
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

export async function getUserCollectionByUsername(
  username: string,
  status?: CollectionStatus
) {
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
