"use server";

import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function getSeriesBySlug(slug: string) {
  try {
    const series = await prisma.series.findUnique({
      where: { slug },
      include: {
        timeline: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        mobileSuits: {
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
        },
        _count: {
          select: {
            mobileSuits: true,
            kits: true,
          },
        },
      },
    });

    if (!series) {
      return null;
    }

    return {
      id: series.id,
      name: series.name,
      slug: series.slug,
      description: series.description,
      timeline: series.timeline,
      mobileSuitsCount: series._count.mobileSuits,
      kitsCount: series._count.kits,
      scrapedImages: series.scrapedImages,
      mobileSuits: series.mobileSuits.map(mobileSuit => ({
        id: mobileSuit.id,
        name: mobileSuit.name,
        slug: mobileSuit.slug,
        description: mobileSuit.description,
        kitsCount: mobileSuit._count.kits,
        scrapedImages: mobileSuit.scrapedImages,
      })),
    };
  } catch (error) {
    console.error('Error fetching series by slug:', error);
    return null;
  }
}

export async function getAllSeries() {
  try {
    const series = await prisma.series.findMany({
      include: {
        timeline: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            mobileSuits: true,
            kits: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return series.map(series => ({
      id: series.id,
      name: series.name,
      slug: series.slug,
      description: series.description,
      timeline: series.timeline,
      mobileSuitsCount: series._count.mobileSuits,
      kitsCount: series._count.kits,
      scrapedImages: series.scrapedImages,
    }));
  } catch (error) {
    console.error('Error fetching all series:', error);
    return [];
  }
}

export async function getSeriesByTimeline(timelineId: string) {
  try {
    const series = await prisma.series.findMany({
      where: { timelineId },
      include: {
        _count: {
          select: {
            mobileSuits: true,
            kits: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return series.map(series => ({
      id: series.id,
      name: series.name,
      slug: series.slug,
      description: series.description,
      mobileSuitsCount: series._count.mobileSuits,
      kitsCount: series._count.kits,
      scrapedImages: series.scrapedImages,
    }));
  } catch (error) {
    console.error('Error fetching series by timeline:', error);
    return [];
  }
}

export async function updateSeriesTimeline(seriesIds: string[], timelineId: string | null) {
  try {
    const result = await prisma.series.updateMany({
      where: {
        id: {
          in: seriesIds,
        },
      },
      data: {
        timelineId,
      },
    });

    return { success: true, updatedCount: result.count };
  } catch (error) {
    console.error('Error updating series timeline:', error);
    return { success: false, error: 'Failed to update series timeline' };
  }
}
