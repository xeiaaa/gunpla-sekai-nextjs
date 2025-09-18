"use server";

import { prisma } from "@/lib/prisma";

export async function getAllReleaseTypes() {
  try {
    const releaseTypes = await prisma.releaseType.findMany({
      include: {
        _count: {
          select: {
            kits: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return releaseTypes.map(releaseType => ({
      id: releaseType.id,
      name: releaseType.name,
      slug: releaseType.slug,
      kitsCount: releaseType._count.kits,
    }));
  } catch (error) {
    console.error('Error fetching all release types:', error);
    return [];
  }
}

export async function getReleaseTypeBySlug(slug: string) {
  try {
    const releaseType = await prisma.releaseType.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            kits: true,
          },
        },
      },
    });

    if (!releaseType) {
      return null;
    }

    return {
      id: releaseType.id,
      name: releaseType.name,
      slug: releaseType.slug,
      kitsCount: releaseType._count.kits,
    };
  } catch (error) {
    console.error('Error fetching release type by slug:', error);
    return null;
  }
}

export async function getReleaseTypeKits(releaseTypeId: string, limit: number = 20, offset: number = 0) {
  try {
    const kits = await prisma.kit.findMany({
      where: { releaseTypeId },
      include: {
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
      orderBy: [
        { releaseDate: "desc" },
        { name: "asc" },
      ],
      take: limit,
      skip: offset,
    });

    return kits.map(kit => ({
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate,
      priceYen: kit.priceYen,
      boxArt: kit.boxArt,
      grade: kit.productLine?.grade.name,
      productLine: kit.productLine?.name || null,
      series: kit.series?.name || null,
      releaseType: kit.releaseType?.name || null,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));
  } catch (error) {
    console.error('Error fetching release type kits:', error);
    return [];
  }
}

export async function getReleaseTypeAnalytics(releaseTypeId: string) {
  try {
    // This query doesn't work as expected with Prisma's groupBy and include
    // Let's use a different approach
    const gradeCounts = await prisma.kit.findMany({
      where: { releaseTypeId },
      select: {
        productLine: {
          select: {
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    const gradeAnalytics = gradeCounts.reduce((acc, kit) => {
      const gradeName = kit.productLine?.grade.name;
      acc[gradeName] = (acc[gradeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(gradeAnalytics).map(([gradeName, count]) => ({
      gradeName,
      count,
    }));
  } catch (error) {
    console.error('Error fetching release type analytics:', error);
    return [];
  }
}
