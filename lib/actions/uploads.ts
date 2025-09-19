"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { KitImageType } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

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

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new Error("Admin access required");
  }

  try {
    const kitUpload = await prisma.kitUpload.create({
      data: {
        kitId: data.kitId,
        uploadId: data.uploadId,
        type: data.type,
        caption: data.caption,
        order: data.order,
      },
      include: {
        upload: true,
        kit: {
          select: {
            slug: true,
          },
        },
      },
    });

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

export async function deleteKitUpload(kitUploadId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) {
    throw new Error("Admin access required");
  }

  try {
    const kitUpload = await prisma.kitUpload.findUnique({
      where: { id: kitUploadId },
      include: {
        kit: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!kitUpload) {
      throw new Error("Kit upload not found");
    }

    await prisma.kitUpload.delete({
      where: { id: kitUploadId },
    });

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
    const kitUploads = await prisma.kitUpload.findMany({
      where: { kitId },
      include: {
        upload: true,
      },
      orderBy: { order: 'asc' },
    });

    return kitUploads;
  } catch (error) {
    console.error("Error fetching kit uploads:", error);
    throw new Error("Failed to fetch kit uploads");
  }
}
