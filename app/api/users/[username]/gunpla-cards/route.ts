import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username },
      select: { id: true, username: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's gunpla cards with kit information
    const gunplaCards = await prisma.gunplaCard.findMany({
      where: { userId: user.id },
      include: {
        upload: {
          select: {
            url: true,
            eagerUrl: true,
            originalFilename: true
          }
        },
        kit: {
          select: {
            name: true,
            slug: true,
            boxArt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for the dome gallery
    const cards = gunplaCards.map(card => ({
      id: card.id,
      src: card.upload.eagerUrl || card.upload.url,
      alt: card.kit.name,
      kitName: card.kit.name,
      kitSlug: card.kit.slug,
      createdAt: card.createdAt,
      originalFilename: card.upload.originalFilename
    }));

    return NextResponse.json({
      user: { id: user.id, username: user.username },
      cards
    });

  } catch (error) {
    console.error("Error fetching user gunpla cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch gunpla cards" },
      { status: 500 }
    );
  }
}
