"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { MilestoneType } from "@/generated/prisma";

export interface CreateMilestoneData {
  buildId: string;
  type: MilestoneType;
  title: string;
  description?: string;
  order: number;
}

export interface UpdateMilestoneData {
  type?: MilestoneType;
  title?: string;
  description?: string;
  completedAt?: Date | null;
  order?: number;
}

export async function createMilestone(data: CreateMilestoneData) {
  const { userId } = await auth();
  console.log("Auth result:", { userId });

  if (!userId) {
    console.error("No userId found in auth");
    throw new Error("Unauthorized");
  }

  try {
    console.log("Creating milestone for buildId:", data.buildId, "userId:", userId);

    // Verify user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: data.buildId,
        userId,
      },
    });

    if (!build) {
      console.error("Build not found or unauthorized. BuildId:", data.buildId, "UserId:", userId);
      throw new Error("Build not found or unauthorized");
    }

    console.log("Build found:", build.id);

    // Validate milestone data
    if (!data.title || !data.title.trim()) {
      throw new Error("Milestone title is required");
    }

    if (!data.type) {
      throw new Error("Milestone type is required");
    }

    if (typeof data.order !== 'number') {
      throw new Error("Milestone order must be a number");
    }

    console.log("Creating milestone with validated data:", {
      buildId: data.buildId,
      type: data.type,
      title: data.title.trim(),
      description: data.description,
      order: data.order,
    });

    const milestone = await prisma.buildMilestone.create({
      data: {
        buildId: data.buildId,
        type: data.type,
        title: data.title.trim(),
        description: data.description,
        order: data.order,
      },
      include: {
        uploads: {
          include: {
            upload: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath(`/builds/${data.buildId}`);
    return milestone;
  } catch (error) {
    console.error("Error creating milestone:", error);
    console.error("Milestone data:", data);
    console.error("User ID:", userId);
    throw new Error(`Failed to create milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function updateMilestone(milestoneId: string, data: UpdateMilestoneData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build
    const milestone = await prisma.buildMilestone.findFirst({
      where: {
        id: milestoneId,
        build: {
          userId,
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or unauthorized");
    }

    const updatedMilestone = await prisma.buildMilestone.update({
      where: { id: milestoneId },
      data,
      include: {
        uploads: {
          include: {
            upload: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    revalidatePath(`/builds/${milestone.buildId}`);
    return updatedMilestone;
  } catch (error) {
    console.error("Error updating milestone:", error);
    throw new Error("Failed to update milestone");
  }
}

export async function deleteMilestone(milestoneId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build and get buildId for revalidation
    const milestone = await prisma.buildMilestone.findFirst({
      where: {
        id: milestoneId,
        build: {
          userId,
        },
      },
      select: { buildId: true },
    });

    if (!milestone) {
      throw new Error("Milestone not found or unauthorized");
    }

    await prisma.buildMilestone.delete({
      where: { id: milestoneId },
    });

    revalidatePath(`/builds/${milestone.buildId}`);
  } catch (error) {
    console.error("Error deleting milestone:", error);
    throw new Error("Failed to delete milestone");
  }
}

export async function reorderMilestones(buildId: string, milestoneIds: string[]) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build
    const build = await prisma.build.findFirst({
      where: {
        id: buildId,
        userId,
      },
    });

    if (!build) {
      throw new Error("Build not found or unauthorized");
    }

    // Update order for each milestone
    const updates = milestoneIds.map((milestoneId, index) =>
      prisma.buildMilestone.update({
        where: { id: milestoneId },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updates);

    revalidatePath(`/builds/${buildId}`);
  } catch (error) {
    console.error("Error reordering milestones:", error);
    throw new Error("Failed to reorder milestones");
  }
}

export async function addImageToMilestone(
  milestoneId: string,
  uploadId: string,
  caption?: string,
  order?: number
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build
    const milestone = await prisma.buildMilestone.findFirst({
      where: {
        id: milestoneId,
        build: {
          userId,
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or unauthorized");
    }

    // Verify upload exists and belongs to user
    const upload = await prisma.upload.findFirst({
      where: {
        id: uploadId,
        uploadedById: userId,
      },
    });

    if (!upload) {
      throw new Error("Upload not found or unauthorized");
    }

    const buildMilestoneUpload = await prisma.buildMilestoneUpload.create({
      data: {
        buildMilestoneId: milestoneId,
        uploadId,
        caption,
        order: order || 0,
      },
      include: {
        upload: true,
      },
    });

    revalidatePath(`/builds/${milestone.buildId}`);
    return buildMilestoneUpload;
  } catch (error) {
    console.error("Error adding image to milestone:", error);
    throw new Error("Failed to add image to milestone");
  }
}

export async function removeImageFromMilestone(milestoneId: string, buildMilestoneUploadId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build and the buildMilestoneUpload exists
    const buildMilestoneUpload = await prisma.buildMilestoneUpload.findFirst({
      where: {
        id: buildMilestoneUploadId,
        buildMilestone: {
          build: {
            userId,
          },
        },
      },
      include: {
        buildMilestone: {
          select: {
            buildId: true,
          },
        },
      },
    });

    if (!buildMilestoneUpload) {
      throw new Error("Image not found or unauthorized");
    }

    await prisma.buildMilestoneUpload.delete({
      where: {
        id: buildMilestoneUploadId,
      },
    });

    revalidatePath(`/builds/${buildMilestoneUpload.buildMilestone.buildId}`);
  } catch (error) {
    console.error("Error removing image from milestone:", error);
    throw new Error("Failed to remove image from milestone");
  }
}

export async function updateMilestoneImage(
  milestoneId: string,
  buildMilestoneUploadId: string,
  caption?: string,
  order?: number
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    console.log("Updating milestone image caption:", {
      milestoneId,
      buildMilestoneUploadId,
      caption,
      captionLength: caption?.length
    });

    // Verify user owns the build and the buildMilestoneUpload exists
    const buildMilestoneUpload = await prisma.buildMilestoneUpload.findFirst({
      where: {
        id: buildMilestoneUploadId,
        buildMilestone: {
          build: {
            userId,
          },
        },
      },
      include: {
        buildMilestone: {
          select: {
            buildId: true,
          },
        },
      },
    });

    if (!buildMilestoneUpload) {
      throw new Error("Image not found or unauthorized");
    }

    const updatedBuildMilestoneUpload = await prisma.buildMilestoneUpload.update({
      where: {
        id: buildMilestoneUploadId,
      },
      data: {
        caption,
        order,
      },
      include: {
        upload: true,
      },
    });

    console.log("Caption updated successfully:", {
      originalCaption: caption,
      savedCaption: updatedBuildMilestoneUpload.caption,
      savedCaptionLength: updatedBuildMilestoneUpload.caption?.length
    });

    revalidatePath(`/builds/${buildMilestoneUpload.buildMilestone.buildId}`);
    return updatedBuildMilestoneUpload;
  } catch (error) {
    console.error("Error updating milestone image:", error);
    throw new Error("Failed to update milestone image");
  }
}

// New actions for media library integration
export async function setMilestoneImages(
  milestoneId: string,
  uploadIds: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build
    const milestone = await prisma.buildMilestone.findFirst({
      where: {
        id: milestoneId,
        build: {
          userId,
        },
      },
      include: {
        build: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or unauthorized");
    }

    // Verify all uploads exist and belong to the build
    const buildUploads = await prisma.buildUpload.findMany({
      where: {
        buildId: milestone.build.id,
        uploadId: {
          in: uploadIds,
        },
      },
    });

    if (buildUploads.length !== uploadIds.length) {
      throw new Error("Some images are not available in the build gallery");
    }

    // Remove existing milestone images
    await prisma.buildMilestoneUpload.deleteMany({
      where: {
        buildMilestoneId: milestoneId,
      },
    });

    // Add new milestone images
    if (uploadIds.length > 0) {
      const milestoneImages = uploadIds.map((uploadId, index) => ({
        buildMilestoneId: milestoneId,
        uploadId,
        order: index,
      }));

      await prisma.buildMilestoneUpload.createMany({
        data: milestoneImages,
      });
    }

    revalidatePath(`/builds/${milestone.build.id}`);
  } catch (error) {
    console.error("Error setting milestone images:", error);
    throw new Error("Failed to set milestone images");
  }
}

export async function reorderMilestoneImages(
  milestoneId: string,
  uploadIds: string[]
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify user owns the build
    const milestone = await prisma.buildMilestone.findFirst({
      where: {
        id: milestoneId,
        build: {
          userId,
        },
      },
      include: {
        build: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!milestone) {
      throw new Error("Milestone not found or unauthorized");
    }

    // Update order for each milestone image
    const updates = uploadIds.map((uploadId, index) =>
      prisma.buildMilestoneUpload.updateMany({
        where: {
          buildMilestoneId: milestoneId,
          uploadId,
        },
        data: { order: index },
      })
    );

    await Promise.all(updates);

    revalidatePath(`/builds/${milestone.build.id}`);
  } catch (error) {
    console.error("Error reordering milestone images:", error);
    throw new Error("Failed to reorder milestone images");
  }
}
