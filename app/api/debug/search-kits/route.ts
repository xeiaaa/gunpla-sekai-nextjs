import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const kits = await prisma.kit.findMany({
      where: {
        slug: {
          contains: query.trim(),
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        number: true,
        variant: true,
        boxArt: true,
        notes: true,
        productLine: {
          select: {
            name: true,
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ number: "asc" }, { name: "asc" }],
      take: 20, // Limit results for performance
    });

    return NextResponse.json(kits);
  } catch (error) {
    console.error("Error searching kits:", error);
    return NextResponse.json(
      { message: "Failed to search kits" },
      { status: 500 }
    );
  }
}
