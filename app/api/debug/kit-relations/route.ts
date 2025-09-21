import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KitExpansionType } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
    const { expansionKitId, selectedKits } = body;

    if (!expansionKitId || !selectedKits || !Array.isArray(selectedKits)) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Validate that the expansion kit exists
    const expansionKit = await prisma.kit.findUnique({
      where: { id: expansionKitId },
    });

    if (!expansionKit) {
      return NextResponse.json(
        { message: `Expansion kit not found with ID: ${expansionKitId}` },
        { status: 404 }
      );
    }

    // Validate that all selected kits exist
    const selectedKitIds = selectedKits.map((k: any) => k.kitId);
    const existingKits = await prisma.kit.findMany({
      where: {
        id: {
          in: selectedKitIds,
        },
      },
      select: { id: true },
    });

    if (existingKits.length !== selectedKitIds.length) {
      const foundIds = existingKits.map((k) => k.id);
      const missingIds = selectedKitIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        {
          message: `One or more selected kits not found. Missing IDs: ${missingIds.join(
            ", "
          )}`,
        },
        { status: 404 }
      );
    }

    // Create kit relations
    const relations = selectedKits.map((selectedKit: any) => ({
      kitId: selectedKit.kitId,
      expansionId: expansionKitId,
      type: selectedKit.expansionType as KitExpansionType,
    }));

    // Use createMany to insert multiple relations
    const result = await prisma.kitRelation.createMany({
      data: relations,
      skipDuplicates: true, // Skip if relation already exists
    });

    return NextResponse.json({
      message: `Created ${result.count} kit relations`,
      count: result.count,
    });
  } catch (error) {
    console.error("Error creating kit relations:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body: body || "Failed to parse body",
    });
    return NextResponse.json(
      {
        message: "Failed to create kit relations",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
