"use server";

import { prisma } from "@/lib/prisma";

export async function getMobileSuitBySlug(slug: string) {
  try {
    const mobileSuit = await prisma.mobileSuit.findUnique({
      where: { slug },
      include: {
        series: {
          select: {
            id: true,
            name: true,
            slug: true,
            timeline: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        kits: {
          include: {
            kit: {
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
                releaseType: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            kit: {
              releaseDate: 'asc',
            },
          },
        },
        _count: {
          select: {
            kits: true,
          },
        },
      },
    });

    if (!mobileSuit) {
      return null;
    }

    return {
      id: mobileSuit.id,
      name: mobileSuit.name,
      slug: mobileSuit.slug,
      description: mobileSuit.description,
      series: mobileSuit.series,
      kitsCount: mobileSuit._count.kits,
      scrapedImages: mobileSuit.scrapedImages,
      kits: mobileSuit.kits.map(kitRelation => ({
        id: kitRelation.kit.id,
        name: kitRelation.kit.name,
        slug: kitRelation.kit.slug,
        number: kitRelation.kit.number,
        variant: kitRelation.kit.variant,
        releaseDate: kitRelation.kit.releaseDate,
        priceYen: kitRelation.kit.priceYen,
        boxArt: kitRelation.kit.boxArt,
        grade: kitRelation.kit.productLine?.grade.name,
        productLine: kitRelation.kit.productLine?.name,
        releaseType: kitRelation.kit.releaseType?.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching mobile suit by slug:', error);
    return null;
  }
}

export async function getAllMobileSuits() {
  try {
    const mobileSuits = await prisma.mobileSuit.findMany({
      include: {
        series: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
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

    return mobileSuits.map(mobileSuit => ({
      id: mobileSuit.id,
      name: mobileSuit.name,
      slug: mobileSuit.slug,
      description: mobileSuit.description,
      series: mobileSuit.series,
      kitsCount: mobileSuit._count.kits,
      scrapedImages: mobileSuit.scrapedImages,
    }));
  } catch (error) {
    console.error('Error fetching all mobile suits:', error);
    return [];
  }
}

export async function getMobileSuitsBySeries(seriesId: string) {
  try {
    const mobileSuits = await prisma.mobileSuit.findMany({
      where: { seriesId },
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

    return mobileSuits.map(mobileSuit => ({
      id: mobileSuit.id,
      name: mobileSuit.name,
      slug: mobileSuit.slug,
      description: mobileSuit.description,
      kitsCount: mobileSuit._count.kits,
      scrapedImages: mobileSuit.scrapedImages,
    }));
  } catch (error) {
    console.error('Error fetching mobile suits by series:', error);
    return [];
  }
}

export async function updateMobileSuitSeries(mobileSuitIds: string[], seriesId: string | null) {
  try {
    const result = await prisma.mobileSuit.updateMany({
      where: {
        id: {
          in: mobileSuitIds,
        },
      },
      data: {
        seriesId,
      },
    });

    return { success: true, updatedCount: result.count };
  } catch (error) {
    console.error('Error updating mobile suit series:', error);
    return { success: false, error: 'Failed to update mobile suit series' };
  }
}
