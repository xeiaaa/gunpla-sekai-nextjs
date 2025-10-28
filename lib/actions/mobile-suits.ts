"use server";

import { prisma } from "@/lib/prisma";
import { apiClient } from "../api-client";

export interface Series {
  id: string
  name: string
  slug: string | null
  description: string
  timelineId: string
  logoUrl: string
  bannerUrl: string
  scrapedImages: string[],
  createdAt: Date;
  updatedAt: Date;
}

export interface MobileSuit {
  name: string;
  id: string;
  slug: string | null;
  scrapedImages: string[];
  createdAt: Date;
  updatedAt: Date;
  seriesId: string | null;
  description: string | null;
  series: Series | null,
  _count: { kits: number }
}

export interface ListResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

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


export async function getAllMobileSuits({ search = '', skip = 0, take = 20 }) {
  const page = Math.floor(skip / take) + 1;

  const response = await apiClient.get<ListResult<MobileSuit>>(
    `/mobile-suits?include=series,_count.kits&search=${search}&page=${page}&limit=${take}&sort=name:asc`,
  );

  return response.items.map(mobileSuit => ({
    id: mobileSuit.id,
    name: mobileSuit.name,
    slug: mobileSuit.slug,
    description: mobileSuit.description,
    series: mobileSuit.series,
    kitsCount: mobileSuit._count.kits,
    scrapedImages: mobileSuit.scrapedImages,
  }));
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
