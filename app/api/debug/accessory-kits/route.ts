import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch kits based on notes containing specific phrases (case insensitive)
    const notesKits = await prisma.kit.findMany({
      where: {
        OR: [
          {
            notes: {
              contains: "accessory kit",
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: "accessory for",
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: "accessory set",
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: "armor parts for",
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: "kit for",
              mode: "insensitive",
            },
          },
          {
            notes: {
              contains: "resin",
              mode: "insensitive",
            },
          },
        ],
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
        expandedBy: {
          select: {
            id: true,
            kit: {
              select: {
                id: true,
                name: true,
                number: true,
              },
            },
            type: true,
          },
        },
      },
      orderBy: [{ number: "asc" }, { name: "asc" }],
    });

    // Fetch kits based on name containing specific terms
    const nameKits = await prisma.kit.findMany({
      where: {
        OR: [
          {
            name: {
              contains: "LED",
              mode: "default", // case sensitive
            },
          },
          {
            name: {
              contains: "expansion",
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: "effect",
              mode: "insensitive",
            },
          },
        ],
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
        expandedBy: {
          select: {
            id: true,
            kit: {
              select: {
                id: true,
                name: true,
                number: true,
              },
            },
            type: true,
          },
        },
      },
      orderBy: [{ number: "asc" }, { name: "asc" }],
    });

    // Combine all results and remove duplicates
    const allKits = [...notesKits, ...nameKits];
    const uniqueKits = allKits.filter(
      (kit, index, self) => index === self.findIndex((k) => k.id === kit.id)
    );

    // Sort the final results
    uniqueKits.sort((a, b) => {
      if (a.number !== b.number) {
        return a.number.localeCompare(b.number, undefined, { numeric: true });
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(uniqueKits);
  } catch (error) {
    console.error("Error fetching accessory kits:", error);
    return NextResponse.json(
      { message: "Failed to fetch accessory kits" },
      { status: 500 }
    );
  }
}
