"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface KitFilters {
  gradeIds?: string[];
  productLineIds?: string[];
  mobileSuitIds?: string[];
  seriesIds?: string[];
  releaseTypeIds?: string[];
  searchTerm?: string;
  sortBy?: string;
  order?: string;
}

export async function getFilteredKits(filters: KitFilters = {}) {
  try {
    const {
      gradeIds = [],
      productLineIds = [],
      mobileSuitIds = [],
      seriesIds = [],
      releaseTypeIds = [],
      searchTerm = "",
      sortBy = "relevance",
      order = "most-relevant"
    } = filters;

    // Build where clause
    const where: any = {};

    if (gradeIds.length > 0) {
      where.productLine = {
        gradeId: { in: gradeIds }
      };
    }

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

    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { number: { contains: searchTerm, mode: 'insensitive' } },
        { variant: { contains: searchTerm, mode: 'insensitive' } },
        {
          mobileSuits: {
            some: {
              mobileSuit: {
                name: { contains: searchTerm, mode: 'insensitive' }
              }
            }
          }
        }
      ];
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
        // Complex sorting: base kits first, main grades prioritized, accessory kits last
        orderBy = [
          { baseKitId: "desc" }, // null values (base kits) come first with desc
          {
            productLine: {
              grade: {
                slug: "asc"
              }
            }
          },
          { name: "asc" }
        ];
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
                slug: true,
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

    // Custom sorting logic for main grades and accessory kits
    const mainGradeSlugs = ['pg', 'rg', 'mg', 'hg', 'eg', 're-100', 'fm', 'mega-size'];

    const sortedKits = kits.sort((a, b) => {
      // First: baseKitId (null first)
      if (a.baseKitId === null && b.baseKitId !== null) return -1;
      if (a.baseKitId !== null && b.baseKitId === null) return 1;

      // Second: accessory kits last (check notes for "accessory")
      const aIsAccessory = a.notes?.toLowerCase().includes('accessory') || false;
      const bIsAccessory = b.notes?.toLowerCase().includes('accessory') || false;
      if (aIsAccessory && !bIsAccessory) return 1;
      if (!aIsAccessory && bIsAccessory) return -1;

      // Third: main grades prioritized
      const aGradeSlug = a.productLine?.grade?.slug;
      const bGradeSlug = b.productLine?.grade?.slug;
      const aIsMainGrade = aGradeSlug ? mainGradeSlugs.includes(aGradeSlug) : false;
      const bIsMainGrade = bGradeSlug ? mainGradeSlugs.includes(bGradeSlug) : false;

      if (aIsMainGrade && !bIsMainGrade) return -1;
      if (!aIsMainGrade && bIsMainGrade) return 1;

      // If both are main grades, sort by the order in mainGradeSlugs array
      if (aIsMainGrade && bIsMainGrade) {
        const aIndex = mainGradeSlugs.indexOf(aGradeSlug!);
        const bIndex = mainGradeSlugs.indexOf(bGradeSlug!);
        return aIndex - bIndex;
      }

      // Finally: sort by name
      return a.name.localeCompare(b.name);
    });

    return sortedKits.map(kit => ({
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

export async function addKitToMobileSuits(kitIds: string[], mobileSuitIds: string[]) {
  try {
    // Create all combinations of kit-mobile suit pairs
    const kitMobileSuitPairs = kitIds.flatMap(kitId =>
      mobileSuitIds.map(mobileSuitId => ({
        kitId,
        mobileSuitId
      }))
    );

    // Use createMany with skipDuplicates to handle existing relationships
    const result = await prisma.kitMobileSuit.createMany({
      data: kitMobileSuitPairs,
      skipDuplicates: true
    });

    return {
      success: true,
      createdCount: result.count
    };
  } catch (error) {
    console.error('Error adding kits to mobile suits:', error);
    return {
      success: false,
      error: 'Failed to add kits to mobile suits'
    };
  }
}

export async function removeKitFromMobileSuits(kitIds: string[], mobileSuitIds: string[]) {
  try {
    const result = await prisma.kitMobileSuit.deleteMany({
      where: {
        kitId: { in: kitIds },
        mobileSuitId: { in: mobileSuitIds }
      }
    });

    return {
      success: true,
      deletedCount: result.count
    };
  } catch (error) {
    console.error('Error removing kits from mobile suits:', error);
    return {
      success: false,
      error: 'Failed to remove kits from mobile suits'
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
        grade: kit.baseKit.productLine?.grade.name || null,
      } : null,
      variants: kit.variants.map(variant => ({
        ...variant,
        grade: variant.productLine?.grade.name || null,
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
        kitUploadId: u.id, // Keep the KitUpload ID for deletion
        url: u.upload.url,
        type: u.type,
        title: u.caption || u.upload.originalFilename,
        description: u.caption,
        createdAt: u.upload.createdAt,
      })),
      otherVariants: otherVariants.map(variant => ({
        ...variant,
        grade: variant.productLine?.grade.name || null,
      })),
    };
  } catch (error) {
    console.error('Error fetching kit by slug:', error);
    return null;
  }
}

export interface UpdateKitData {
  name?: string;
  slug?: string;
  number?: string;
  variant?: string;
  releaseDate?: Date | null;
  priceYen?: number | null;
  region?: string;
  boxArt?: string;
  notes?: string;
  scrapedImages?: string[];
}

export async function updateKit(kitId: string, data: UpdateKitData) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "User must be authenticated" };
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return { success: false, error: "Admin access required" };
    }

    // Check if kit exists
    const existingKit = await prisma.kit.findUnique({
      where: { id: kitId },
    });

    if (!existingKit) {
      return { success: false, error: "Kit not found" };
    }

    // Update the kit
    const updatedKit = await prisma.kit.update({
      where: { id: kitId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    // Revalidate relevant paths
    revalidatePath("/kits");
    revalidatePath(`/kits/${existingKit.slug}`);
    if (data.slug && data.slug !== existingKit.slug) {
      revalidatePath(`/kits/${data.slug}`);
    }

    return { success: true, kit: updatedKit };
  } catch (error) {
    console.error('Error updating kit:', error);
    return { success: false, error: "Failed to update kit" };
  }
}
