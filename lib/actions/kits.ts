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
            slug: true,
          },
        },
        releaseType: {
          select: {
            name: true,
            slug: true,
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
      slug: kit.slug,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate,
      priceYen: kit.priceYen,
      boxArt: kit.boxArt,
      grade: kit.productLine?.grade.name || null,
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

export async function getAllKits() {
  try {
    const kits = await prisma.kit.findMany({
      include: {
        productLine: {
          select: {
            id: true,
            name: true,
            slug: true,
            grade: {
              select: {
                name: true,
              },
            },
          },
        },
        series: {
          select: {
            id: true,
            name: true,
            slug: true,
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
        _count: {
          select: {
            mobileSuits: true,
          },
        },
      },
      orderBy: [
        { name: "asc" },
      ],
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
      scrapedImages: kit.scrapedImages,
      grade: kit.productLine?.grade.name || null,
      productLine: kit.productLine,
      series: kit.series,
      mobileSuitsCount: kit._count.mobileSuits,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));
  } catch (error) {
    console.error('Error fetching all kits:', error);
    return [];
  }
}

export async function updateKitProductLine(kitIds: string[], productLineId: string | null) {
  try {
    const result = await prisma.kit.updateMany({
      where: {
        id: { in: kitIds },
      },
      data: {
        productLineId: productLineId,
      },
    });

    return {
      success: true,
      updatedCount: result.count,
    };
  } catch (error) {
    console.error('Error updating kit product lines:', error);
    return {
      success: false,
      error: 'Failed to update kit product lines',
    };
  }
}

export async function getKitBySlug(slug: string) {
  try {
    const kit = await prisma.kit.findUnique({
      where: { slug },
      include: {
        productLine: {
          select: {
            name: true,
            logo: true,
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
            slug: true,
          },
        },
        releaseType: {
          select: {
            name: true,
            slug: true,
          },
        },
        baseKit: {
          select: {
            id: true,
            name: true,
            slug: true,
            number: true,
            boxArt: true,
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
        },
        variants: {
          select: {
            id: true,
            name: true,
            slug: true,
            number: true,
            variant: true,
            boxArt: true,
            releaseDate: true,
            priceYen: true,
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
          orderBy: {
            releaseDate: 'asc',
          },
        },
        mobileSuits: {
          include: {
            mobileSuit: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                scrapedImages: true,
                series: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        uploads: {
          include: {
            upload: {
              select: {
                id: true,
                url: true,
                originalFilename: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!kit) {
      return null;
    }

    // Fetch other variants (sibling kits that share the same base kit, excluding current kit)
    let otherVariants: any[] = [];
    if (kit.baseKitId) {
      otherVariants = await prisma.kit.findMany({
        where: {
          baseKitId: kit.baseKitId,
          id: {
            not: kit.id
          }
        },
        select: {
          id: true,
          name: true,
          slug: true,
          number: true,
          variant: true,
          boxArt: true,
          releaseDate: true,
          priceYen: true,
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
        orderBy: {
          releaseDate: 'asc',
        },
      });
    }

    return {
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate,
      priceYen: kit.priceYen,
      region: kit.region,
      boxArt: kit.boxArt,
      notes: kit.notes,
      manualLinks: kit.manualLinks,
      scrapedImages: kit.scrapedImages,
      grade: kit.productLine?.grade.name || null,
      productLine: kit.productLine ? {
        name: kit.productLine.name,
        logo: kit.productLine.logo?.url || null,
      } : null,
      series: kit.series?.name,
      seriesSlug: kit.series?.slug,
      releaseType: kit.releaseType?.name,
      releaseTypeSlug: kit.releaseType?.slug,
      baseKit: kit.baseKit ? {
        ...kit.baseKit,
        grade: kit.baseKit.productLine?.grade.name,
      } : null,
      variants: kit.variants.map(variant => ({
        ...variant,
        grade: variant.productLine?.grade.name,
      })),
      mobileSuits: kit.mobileSuits.map(ms => ({
        id: ms.mobileSuit.id,
        name: ms.mobileSuit.name,
        slug: ms.mobileSuit.slug,
        description: ms.mobileSuit.description,
        scrapedImages: ms.mobileSuit.scrapedImages,
        series: ms.mobileSuit.series?.name,
      })),
      uploads: kit.uploads.map(u => ({
        id: u.upload.id,
        url: u.upload.url,
        type: u.type,
        title: u.caption || u.upload.originalFilename,
        description: u.caption,
        createdAt: u.upload.createdAt,
      })),
      otherVariants: otherVariants.map(variant => ({
        ...variant,
        grade: variant.productLine?.grade.name,
      })),
    };
  } catch (error) {
    console.error('Error fetching kit by slug:', error);
    return null;
  }
}
