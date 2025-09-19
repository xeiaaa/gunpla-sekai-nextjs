"use server";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "../../generated/prisma";

interface SearchFilters {
  timeline: string;
  grade: string;
  sortBy: string;
}

interface KitResult {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  releaseDate: Date | null;
  priceYen: number | null;
  boxArt: string | null;
  grade: string | null;
  productLine: string | undefined;
  series: string | undefined;
  timeline: string | undefined;
  mobileSuits: string[];
}

interface MobileSuitResult {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  series: string | undefined;
  timeline: string | undefined;
  kitsCount: number;
  scrapedImages: string[];
}

interface SearchResult {
  kits: KitResult[];
  mobileSuits: MobileSuitResult[];
  totalKits: number;
  totalMobileSuits: number;
  hasMore: boolean;
}

export async function searchKitsAndMobileSuits(
  query: string,
  filters: SearchFilters
): Promise<SearchResult> {
  try {
    // Build where clause for kits
    const kitWhere: Prisma.KitWhereInput = {};

    if (query) {
      kitWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { number: { contains: query, mode: 'insensitive' } },
        { variant: { contains: query, mode: 'insensitive' } },
        {
          mobileSuits: {
            some: {
              mobileSuit: {
                name: { contains: query, mode: 'insensitive' }
              }
            }
          }
        },
        {
          series: {
            name: { contains: query, mode: 'insensitive' }
          }
        }
      ];
    }

    // Apply timeline filter
    if (filters.timeline !== "all") {
      kitWhere.series = {
        timeline: {
          slug: filters.timeline
        }
      };
    }

    // Apply grade filter
    if (filters.grade !== "all") {
      kitWhere.productLine = {
        grade: {
          slug: filters.grade
        }
      };
    }

    // Build orderBy clause for kits
    let kitOrderBy: Prisma.KitOrderByWithRelationInput | Prisma.KitOrderByWithRelationInput[] = { name: "asc" };

    switch (filters.sortBy) {
      case "name-asc":
        kitOrderBy = { name: "asc" };
        break;
      case "name-desc":
        kitOrderBy = { name: "desc" };
        break;
      case "release-desc":
        kitOrderBy = { releaseDate: "desc" };
        break;
      case "release-asc":
        kitOrderBy = { releaseDate: "asc" };
        break;
      case "price-asc":
        kitOrderBy = { priceYen: "asc" };
        break;
      case "price-desc":
        kitOrderBy = { priceYen: "desc" };
        break;
      default: // relevance
        // Complex sorting: base kits first, main grades prioritized, accessory kits last
        kitOrderBy = [
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

    // Fetch kits
    const kits = await prisma.kit.findMany({
      where: kitWhere,
      orderBy: kitOrderBy,
      take: 8, // Show 8 results
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
            timeline: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        mobileSuits: {
          include: {
            mobileSuit: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Custom sorting logic for main grades and accessory kits (only for relevance sort)
    let sortedKits = kits;
    if (filters.sortBy === "relevance" || !filters.sortBy) {
      // Define grade priority order (same as Meilisearch logic)
      const gradePriority = ['pg', 'mg', 'rg', 'hg', 'eg', 'fm'];

      sortedKits = kits.sort((a, b) => {
        // First: prioritize kits released 2010 and above
        const aReleaseYear = a.releaseDate ? a.releaseDate.getFullYear() : null;
        const bReleaseYear = b.releaseDate ? b.releaseDate.getFullYear() : null;

        // Handle null release dates (put them last)
        if (aReleaseYear === null && bReleaseYear !== null) return 1;
        if (aReleaseYear !== null && bReleaseYear === null) return -1;
        if (aReleaseYear === null && bReleaseYear === null) {
          // Within kits without release date, prioritize by grade
          const aGradeSlug = a.productLine?.grade?.slug;
          const bGradeSlug = b.productLine?.grade?.slug;
          const aGradeIndex = gradePriority.indexOf(aGradeSlug);
          const bGradeIndex = gradePriority.indexOf(bGradeSlug);

          if (aGradeIndex !== -1 && bGradeIndex !== -1) return aGradeIndex - bGradeIndex;
          if (aGradeIndex !== -1 && bGradeIndex === -1) return -1;
          if (aGradeIndex === -1 && bGradeIndex !== -1) return 1;

          return a.name.localeCompare(b.name);
        }

        if (aReleaseYear >= 2010 && bReleaseYear < 2010) return -1;
        if (aReleaseYear < 2010 && bReleaseYear >= 2010) return 1;

        // Second: baseKitId (null first) - only within same release era
        if (aReleaseYear === bReleaseYear || (aReleaseYear >= 2010 && bReleaseYear >= 2010) || (aReleaseYear < 2010 && bReleaseYear < 2010)) {
          if (a.baseKitId === null && b.baseKitId !== null) return -1;
          if (a.baseKitId !== null && b.baseKitId === null) return 1;
        }

        // Third: accessory kits last (check notes for "accessory") - only within same release era and base kit status
        const aIsAccessory = a.notes?.toLowerCase().includes('accessory') || false;
        const bIsAccessory = b.notes?.toLowerCase().includes('accessory') || false;
        if (aIsAccessory && !bIsAccessory) return 1;
        if (!aIsAccessory && bIsAccessory) return -1;

        // Fourth: prioritize by grade priority order
        const aGradeSlug = a.productLine?.grade?.slug;
        const bGradeSlug = b.productLine?.grade?.slug;
        const aGradeIndex = gradePriority.indexOf(aGradeSlug);
        const bGradeIndex = gradePriority.indexOf(bGradeSlug);

        if (aGradeIndex !== -1 && bGradeIndex !== -1) {
          if (aGradeIndex !== bGradeIndex) return aGradeIndex - bGradeIndex;
        } else if (aGradeIndex !== -1 && bGradeIndex === -1) {
          return -1; // Prioritize kits with preferred grades
        } else if (aGradeIndex === -1 && bGradeIndex !== -1) {
          return 1;
        }

        // Within same category, sort by release date (newest first)
        if (aReleaseYear === bReleaseYear && a.releaseDate && b.releaseDate) {
          return b.releaseDate.getTime() - a.releaseDate.getTime();
        }

        // Finally: sort by name
        return a.name.localeCompare(b.name);
      });
    }

    // Build where clause for mobile suits
    const mobileSuitWhere: Prisma.MobileSuitWhereInput = {};

    if (query) {
      mobileSuitWhere.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        {
          series: {
            name: { contains: query, mode: 'insensitive' }
          }
        }
      ];
    }

    // Apply timeline filter for mobile suits
    if (filters.timeline !== "all") {
      mobileSuitWhere.series = {
        timeline: {
          slug: filters.timeline
        }
      };
    }

    // Fetch mobile suits
    const mobileSuits = await prisma.mobileSuit.findMany({
      where: mobileSuitWhere,
      orderBy: { name: "asc" },
      take: 8, // Show 8 results
      include: {
        series: {
          select: {
            name: true,
            slug: true,
            timeline: {
              select: {
                name: true,
                slug: true,
              },
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

    // Get total counts for pagination
    const totalKits = await prisma.kit.count({ where: kitWhere });
    const totalMobileSuits = await prisma.mobileSuit.count({ where: mobileSuitWhere });

    // Transform kits data
    const transformedKits = sortedKits.map(kit => ({
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
      timeline: kit.series?.timeline?.name,
      mobileSuits: kit.mobileSuits.map(ms => ms.mobileSuit.name),
    }));

    // Transform mobile suits data
    const transformedMobileSuits = mobileSuits.map(ms => ({
      id: ms.id,
      name: ms.name,
      slug: ms.slug,
      description: ms.description,
      series: ms.series?.name,
      timeline: ms.series?.timeline?.name,
      kitsCount: ms._count.kits,
      scrapedImages: ms.scrapedImages,
    }));

    return {
      kits: transformedKits,
      mobileSuits: transformedMobileSuits,
      totalKits,
      totalMobileSuits,
      hasMore: totalKits > 8 || totalMobileSuits > 8,
    };
  } catch (error) {
    console.error('Error searching kits and mobile suits:', error);
    return {
      kits: [],
      mobileSuits: [],
      totalKits: 0,
      totalMobileSuits: 0,
      hasMore: false,
    };
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    if (query.length < 2) {
      return [];
    }

    // Get kit name suggestions
    const kitSuggestions = await prisma.kit.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
      },
      take: 5,
    });

    // Get mobile suit name suggestions
    const mobileSuitSuggestions = await prisma.mobileSuit.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        name: true,
      },
      take: 5,
    });

    // Combine and deduplicate suggestions
    const allSuggestions = [
      ...kitSuggestions.map(k => k.name),
      ...mobileSuitSuggestions.map(ms => ms.name),
    ];

    // Remove duplicates and limit to 5
    const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 5);

    return uniqueSuggestions;
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
}
