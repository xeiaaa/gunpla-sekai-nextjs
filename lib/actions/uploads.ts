"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
