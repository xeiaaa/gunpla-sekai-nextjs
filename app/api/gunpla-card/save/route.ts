import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { kitSlug, uploadData } = await request.json();

    if (!kitSlug || !uploadData) {
      return NextResponse.json(
        { error: "kitSlug and uploadData are required" },
        { status: 400 }
      );
    }

    // Find the kit by slug
    const kit = await prisma.kit.findUnique({
      where: { slug: kitSlug },
      select: { id: true }
    });

    if (!kit) {
      return NextResponse.json(
        { error: "Kit not found" },
        { status: 404 }
      );
    }

    // Check if user already has a gunpla card for this kit
    const existingCard = await prisma.gunplaCard.findUnique({
      where: {
        userId_kitId: {
          userId: userId,
          kitId: kit.id
        }
      },
      include: {
        upload: true
      }
    });

    // If card exists, delete the old one and its associated upload
    if (existingCard) {
      await prisma.gunplaCard.delete({
        where: { id: existingCard.id }
      });

      // Note: The upload will be automatically deleted due to onDelete: Cascade
    }

    // Create the upload record
    const upload = await prisma.upload.create({
      data: {
        cloudinaryAssetId: uploadData.cloudinaryAssetId,
        publicId: uploadData.publicId,
        url: uploadData.url,
        eagerUrl: uploadData.eagerUrl,
        format: uploadData.format,
        resourceType: uploadData.resourceType,
        size: uploadData.size,
        originalFilename: uploadData.originalFilename,
        uploadedAt: uploadData.uploadedAt,
        uploadedById: userId,
      }
    });

    // Create the gunpla card record
    const gunplaCard = await prisma.gunplaCard.create({
      data: {
        uploadId: upload.id,
        userId: userId,
        kitId: kit.id,
      },
      include: {
        upload: true,
        kit: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      gunplaCard: {
        id: gunplaCard.id,
        uploadUrl: gunplaCard.upload.url,
        kitName: gunplaCard.kit.name,
        kitSlug: gunplaCard.kit.slug,
        createdAt: gunplaCard.createdAt
      }
    });

  } catch (error) {
    console.error("Error saving gunpla card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
