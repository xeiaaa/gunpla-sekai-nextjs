import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kitSlug = searchParams.get("kitSlug");

    if (!kitSlug) {
      return NextResponse.json(
        { error: "kitSlug is required" },
        { status: 400 }
      );
    }

    // Find the kit by slug
    const kit = await prisma.kit.findUnique({
      where: { slug: kitSlug },
      select: { id: true, name: true }
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
        upload: {
          select: {
            url: true,
            createdAt: true
          }
        }
      }
    });

    if (existingCard) {
      return NextResponse.json({
        exists: true,
        card: {
          id: existingCard.id,
          uploadUrl: existingCard.upload.url,
          createdAt: existingCard.createdAt,
          kitName: kit.name
        }
      });
    }

    return NextResponse.json({
      exists: false,
      kitName: kit.name
    });

  } catch (error) {
    console.error("Error checking gunpla card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
