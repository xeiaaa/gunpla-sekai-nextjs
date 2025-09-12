"use server";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

interface KitFilters {
  productLineIds?: string[];
  mobileSuitIds?: string[];
  seriesIds?: string[];
  releaseTypeIds?: string[];
  sortBy?: string;
  order?: string;
}

export async function getFilteredKits(filters: KitFilters = {}) {
  try {
    const {
      productLineIds = [],
      mobileSuitIds = [],
      seriesIds = [],
      releaseTypeIds = [],
      sortBy = "relevance",
      order = "most-relevant"
    } = filters;

    // Build where clause
    const where: any = {};

    if (productLineIds.length > 0) {
      where.productLineId = { in: productLineIds };
    }

    if (seriesIds.length > 0) {
      where.seriesId = { in: seriesIds };
    }

    if (releaseTypeIds.length > 0) {
      where.releaseTypeId = { in: releaseTypeIds };
    }

    if (mobileSuitIds.length > 0) {
      where.mobileSuits = {
        some: {
          mobileSuitId: { in: mobileSuitIds }
        }
      };
    }

    // Build orderBy clause
    let orderBy: any = {};

    switch (sortBy) {
      case "name":
        orderBy = { name: order === "ascending" ? "asc" : "desc" };
        break;
      case "release-date":
        orderBy = { releaseDate: order === "ascending" ? "asc" : "desc" };
        break;
      case "rating":
        // Note: You'll need to add rating field to Kit model if you want to sort by rating
        orderBy = { name: "asc" };
        break;
      default: // relevance
        orderBy = { name: "asc" };
    }

    const kits = await prisma.kit.findMany({
      where,
      orderBy,
      include: {
        grade: {
          select: {
            name: true,
          },
        },
        productLine: {
          select: {
            name: true,
          },
        },
        series: {
          select: {
            name: true,
          },
        },
        releaseType: {
          select: {
            name: true,
          },
        },
        mobileSuits: {
          include: {
            mobileSuit: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      take: 50, // Limit results for performance
    });

    return kits.map(kit => ({
      id: kit.id,
      name: kit.name,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate,
      priceYen: kit.priceYen,
      boxArt: kit.boxArt,
      grade: kit.grade.name,
      productLine: kit.productLine?.name,
      series: kit.series?.name,
      releaseType: kit.releaseType?.name,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));
  } catch (error) {
    console.error('Error fetching filtered kits:', error);
    return [];
  }
}
