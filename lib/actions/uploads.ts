"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { apiClient } from "../api-client";
import { KitResponse, KitUploadResponse, ListResult } from "../types/actions";

export interface CreateUploadData {
  cloudinaryAssetId: string;
  publicId: string;
  url: string;
  eagerUrl?: string;
  format: string;
  resourceType: string;
  size: number;
  originalFilename: string;
  uploadedAt: Date;
  uploadedById: string;
}

enum KitImageType {
  BOX_ART = "BOX_ART",
  PRODUCT_SHOTS = "PRODUCT_SHOTS",
  RUNNERS = "RUNNERS",
  MANUAL = "MANUAL",
  PROTOTYPE = "PROTOTYPE",
}

export async function createUpload(data: CreateUploadData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const upload = await prisma.upload.create({
      data: {
        cloudinaryAssetId: data.cloudinaryAssetId,
        publicId: data.publicId,
        url: data.url,
        eagerUrl: data.eagerUrl,
        format: data.format,
        resourceType: data.resourceType,
        size: data.size,
        originalFilename: data.originalFilename,
        uploadedAt: data.uploadedAt,
        uploadedById: userId,
      },
    });

    return upload;
  } catch (error) {
    console.error("Error creating upload:", error);
    throw new Error("Failed to create upload");
  }
}

export async function deleteUpload(uploadId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.upload.delete({
      where: {
        id: uploadId,
        uploadedById: userId, // Ensure user can only delete their own uploads
      },
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    throw new Error("Failed to delete upload");
  }
}

export async function getUserUploads(userId: string, limit: number = 50) {
  try {
    const uploads = await prisma.upload.findMany({
      where: { uploadedById: userId },
      take: limit,
      orderBy: { uploadedAt: "desc" },
    });

    return uploads;
  } catch (error) {
    console.error("Error fetching user uploads:", error);
    throw new Error("Failed to fetch uploads");
  }
}

export async function getBuildMediaItems(buildId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Get all uploads associated with this build through the junction table
    const buildUploads = await prisma.buildUpload.findMany({
      where: {
        build: {
          id: buildId,
          userId: userId, // Ensure user owns the build
        },
      },
      include: {
        upload: true,
      },
      orderBy: { order: "asc" },
    });

    return buildUploads.map(buildUpload => ({
      ...buildUpload.upload,
      caption: buildUpload.caption,
      order: buildUpload.order,
      buildUploadId: buildUpload.id,
    }));
  } catch (error) {
    console.error("Error fetching build media items:", error);
    throw new Error("Failed to fetch build media items");
  }
}

export async function addUploadToBuild(buildId: string, uploadId: string, caption?: string, order?: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId: userId,
      },
    });

    if (!build) {
      throw new Error("Build not found or unauthorized");
    }

    // Create the junction table entry
    const buildUpload = await prisma.buildUpload.create({
      data: {
        buildId,
        uploadId,
        caption,
        order: order ?? 0,
      },
      include: {
        upload: true,
      },
    });

    return buildUpload;
  } catch (error) {
    console.error("Error adding upload to build:", error);
    throw new Error("Failed to add upload to build");
  }
}

export async function removeUploadFromBuild(buildId: string, uploadId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId: userId,
      },
    });

    if (!build) {
      throw new Error("Build not found or unauthorized");
    }

    // Remove the junction table entry
    await prisma.buildUpload.delete({
      where: {
        buildId_uploadId: {
          buildId,
          uploadId,
        },
      },
    });
  } catch (error) {
    console.error("Error removing upload from build:", error);
    throw new Error("Failed to remove upload from build");
  }
}

export async function updateBuildUploadCaption(buildId: string, uploadId: string, caption: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId: userId,
      },
    });

    if (!build) {
      throw new Error("Build not found or unauthorized");
    }

    // Update the caption
    const buildUpload = await prisma.buildUpload.update({
      where: {
        buildId_uploadId: {
          buildId,
          uploadId,
        },
      },
      data: {
        caption,
      },
    });

    return buildUpload;
  } catch (error) {
    console.error("Error updating build upload caption:", error);
    throw new Error("Failed to update caption");
  }
}

export async function reorderBuildUploads(buildId: string, uploadIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId: userId,
      },
    });

    if (!build) {
      throw new Error("Build not found or unauthorized");
    }

    // Update the order for each upload
    const updatePromises = uploadIds.map((uploadId, index) =>
      prisma.buildUpload.update({
        where: {
          buildId_uploadId: {
            buildId,
            uploadId,
          },
        },
        data: {
          order: index,
        },
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error reordering build uploads:", error);
    throw new Error("Failed to reorder uploads");
  }
}

// Kit Upload Functions
export interface CreateKitUploadData {
  kitId: string;
  uploadId: string;
  type: KitImageType;
  caption?: string;
  order?: number;
}

export async function createKitUpload(data: CreateKitUploadData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  try {
    const kitUpload = await apiClient.post<KitUploadResponse>(`/kits/${data.kitId}/uploads`, {
      uploadId: data.uploadId
    })

    // Revalidate kit page
    if (kitUpload.kit.slug) {
      revalidatePath(`/kits/${kitUpload.kit.slug}`);
    }

    return kitUpload;
  } catch (error) {
    console.error("Error creating kit upload:", error);
    throw new Error("Failed to create kit upload");
  }
}

export async function deleteKitUpload(kitId: string, kitUploadId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  try {
    const kitUpload = await apiClient.delete<KitUploadResponse>(`/kits/${kitId}/uploads/${kitUploadId}`)
    if (!kitUpload) {
      throw new Error("Kit upload not found");
    }
    // Revalidate kit page
    if (kitUpload.kit.slug) {
      revalidatePath(`/kits/${kitUpload.kit.slug}`);
    }
  } catch (error) {
    console.error("Error deleting kit upload:", error);
    console.error("Kit upload ID that failed:", kitUploadId);
    throw new Error(`Failed to delete kit upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getKitUploads(kitId: string) {
  try {
    const kitUploads = await apiClient.get<ListResult<KitUploadResponse>>(`/kits/${kitId}/uploads`)

    return kitUploads.items
  } catch (error) {
    console.error("Error fetching kit uploads:", error);
    throw new Error("Failed to fetch kit uploads");
  }
}

export async function updateKitUploadCaption(kitId: string, kitUploadId: string, caption: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const kitUpload = await apiClient.put<KitUploadResponse>(`/kits/${kitId}/uploads/${kitUploadId}`, {
      caption
    })

    // Revalidate kit page
    if (kitUpload.kit.slug) {
      revalidatePath(`/kits/${kitUpload.kit.slug}`);
    }

    return kitUpload;
  } catch (error) {
    console.error("Error updating kit upload caption:", error);
    throw new Error("Failed to update kit upload caption");
  }
}

export async function updateKitUploadType(kitId: string, kitUploadId: string, type: KitImageType) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const kitUpload = await apiClient.put<KitUploadResponse>(`/kits/${kitId}/uploads/${kitUploadId}`, {
      type
    })

    // Revalidate kit page
    if (kitUpload.kit.slug) {
      revalidatePath(`/kits/${kitUpload.kit.slug}`);
    }


    // Revalidate kit page
    if (kitUpload.kit.slug) {
      revalidatePath(`/kits/${kitUpload.kit.slug}`);
    }

    return kitUpload;
  } catch (error) {
    console.error("Error updating kit upload type:", error);
    throw new Error("Failed to update kit upload type");
  }
}

export async function reorderKitUploads(kitId: string, kitUploadIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Update order for each kit upload

    await apiClient.post<KitUploadResponse[]>(`/kits/${kitId}/uploads/reorder`, {
      kitUploadIds
    })

    // Revalidate kit page
    const kit = await apiClient.get<KitResponse>(`/kits/${kitId}`,)
    if (kit?.slug) {
      revalidatePath(`/kits/${kit.slug}`);
    }
  } catch (error) {
    console.error("Error reordering kit uploads:", error);
    throw new Error("Failed to reorder kit uploads");
  }
}
