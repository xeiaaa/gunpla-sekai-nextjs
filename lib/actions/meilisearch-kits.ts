"use server";

import { MeiliSearch } from "meilisearch";
import { prisma } from "@/lib/prisma";

// Initialize Meilisearch client
function getMeilisearchClient() {
  const hostUrl = process.env.MEILI_HOST_URL?.startsWith("http")
    ? process.env.MEILI_HOST_URL
    : `https://${process.env.MEILI_HOST_URL}`;

  if (!hostUrl || !process.env.MEILI_MASTER_KEY) {
    throw new Error(
      "Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY"
    );
  }

  return new MeiliSearch({
    host: hostUrl,
    apiKey: process.env.MEILI_MASTER_KEY,
  });
}

function isVariantSearch(query: string): boolean {
  const variantKeywords = [
    "metallic",
    "clear",
    "ver",
    "version",
    "variant",
    "custom",
    "special",
    "plated",
    "titanium",
    "pearl",
    "chrome",
    "gold",
    "silver",
    "transparent",
    "sd",
    "hg",
    "mg",
    "rg",
    "pg",
    "re",
    "mega",
    "perfect",
    "real",
    "entry",
  ];

  const lowerQuery = query.toLowerCase();
  return variantKeywords.some((keyword) => lowerQuery.includes(keyword));
}

function rankKitsByReleaseDate(kits: any[]): any[] {
  // Sort by release date descending, with NULL dates at the end
  return kits.sort((a, b) => {
    // Handle null release dates (put them last)
    if (a.releaseDate === null && b.releaseDate !== null) return 1;
    if (a.releaseDate !== null && b.releaseDate === null) return -1;
    if (a.releaseDate === null && b.releaseDate === null) return 0;

    // Both have dates, sort by release date descending
    return (
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    );
  });
}

function rankKitsByGradeAndReleaseDate(kits: any[]): any[] {
  // Define grade priority order as specified
  const gradePriority = [
    "pg",
    "mg",
    "rg",
    "hg",
    "fm",
    "eg",
    "mega-size",
    "re-100",
  ];

  return kits.sort((a, b) => {
    const aGradeSlug = a.productLine?.grade?.slug;
    const bGradeSlug = b.productLine?.grade?.slug;
    const aGradeIndex = gradePriority.indexOf(aGradeSlug);
    const bGradeIndex = gradePriority.indexOf(bGradeSlug);

    // First sort by grade priority
    if (aGradeIndex !== -1 && bGradeIndex !== -1) {
      if (aGradeIndex !== bGradeIndex) return aGradeIndex - bGradeIndex;

      // Same grade, sort by release date descending
      if (a.releaseDate && b.releaseDate) {
        return (
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
      }
      // Handle null release dates
      if (a.releaseDate === null && b.releaseDate !== null) return 1;
      if (a.releaseDate !== null && b.releaseDate === null) return -1;
      return 0;
    } else if (aGradeIndex !== -1 && bGradeIndex === -1) {
      return -1; // Prioritize kits with known grades
    } else if (aGradeIndex === -1 && bGradeIndex !== -1) {
      return 1;
    }

    // Both unknown grades, sort by release date descending
    if (a.releaseDate && b.releaseDate) {
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      );
    }
    if (a.releaseDate === null && b.releaseDate !== null) return 1;
    if (a.releaseDate !== null && b.releaseDate === null) return -1;
    return 0;
  });
}

function rankKitsByBaseKitAndReleaseDate(
  kits: any[],
  shouldPrioritizeBaseKits: boolean
): any[] {
  // Define grade priority order
  const gradePriority = ["pg", "mg", "rg", "hg", "eg", "fm"];

  if (!shouldPrioritizeBaseKits) {
    // Even when not prioritizing base kits, still prioritize by release date and grade
    // but preserve Meilisearch relevance order within same categories
    return kits.sort((a, b) => {
      // Prioritize kits released 2010 and above
      const aReleaseYear = a.releaseDate
        ? new Date(a.releaseDate).getFullYear()
        : null;
      const bReleaseYear = b.releaseDate
        ? new Date(b.releaseDate).getFullYear()
        : null;

      // Handle null release dates (put them last)
      if (aReleaseYear === null && bReleaseYear !== null) return 1;
      if (aReleaseYear !== null && bReleaseYear === null) return -1;
      if (aReleaseYear === null && bReleaseYear === null) {
        // Within kits without release date, prioritize by grade, but preserve Meilisearch order within same grade
        const aGradeSlug = a.productLine?.grade?.slug;
        const bGradeSlug = b.productLine?.grade?.slug;
        const aGradeIndex = gradePriority.indexOf(aGradeSlug);
        const bGradeIndex = gradePriority.indexOf(bGradeSlug);

        if (aGradeIndex !== -1 && bGradeIndex !== -1) {
          if (aGradeIndex !== bGradeIndex) return aGradeIndex - bGradeIndex;
          // Same grade - preserve Meilisearch order (don't sort by name)
          return 0;
        }
        if (aGradeIndex !== -1 && bGradeIndex === -1) return -1;
        if (aGradeIndex === -1 && bGradeIndex !== -1) return 1;

        // Both unknown grades - preserve Meilisearch order
        return 0;
      }

      // 2010+ kits first, then older kits
      if (aReleaseYear >= 2010 && bReleaseYear < 2010) return -1;
      if (aReleaseYear < 2010 && bReleaseYear >= 2010) return 1;

      // Within same release era, prioritize by grade, but preserve Meilisearch order within same grade
      const aGradeSlug = a.productLine?.grade?.slug;
      const bGradeSlug = b.productLine?.grade?.slug;
      const aGradeIndex = gradePriority.indexOf(aGradeSlug);
      const bGradeIndex = gradePriority.indexOf(bGradeSlug);

      if (aGradeIndex !== -1 && bGradeIndex !== -1) {
        if (aGradeIndex !== bGradeIndex) return aGradeIndex - bGradeIndex;
        // Same grade and era - preserve Meilisearch order (don't sort by release date or name)
        return 0;
      } else if (aGradeIndex !== -1 && bGradeIndex === -1) {
        return -1; // Prioritize kits with preferred grades
      } else if (aGradeIndex === -1 && bGradeIndex !== -1) {
        return 1;
      }

      // Same era, unknown grades - preserve Meilisearch order
      return 0;
    });
  }

  // Separate kits by release date first, then by base kit status
  const kits2010AndAbove = kits.filter((kit) => {
    if (!kit.releaseDate) return false;
    const releaseYear = new Date(kit.releaseDate).getFullYear();
    return releaseYear >= 2010;
  });

  const kitsBefore2010 = kits.filter((kit) => {
    if (!kit.releaseDate) return false;
    const releaseYear = new Date(kit.releaseDate).getFullYear();
    return releaseYear < 2010;
  });

  const kitsWithoutReleaseDate = kits.filter((kit) => !kit.releaseDate);

  // Helper function to sort by grade priority, but preserve Meilisearch order within same grade
  const sortByGradePreservingRelevance = (a: any, b: any) => {
    const aGradeSlug = a.productLine?.grade?.slug;
    const bGradeSlug = b.productLine?.grade?.slug;
    const aGradeIndex = gradePriority.indexOf(aGradeSlug);
    const bGradeIndex = gradePriority.indexOf(bGradeSlug);

    // First sort by grade priority
    if (aGradeIndex !== -1 && bGradeIndex !== -1) {
      if (aGradeIndex !== bGradeIndex) return aGradeIndex - bGradeIndex;
      // Same grade - preserve Meilisearch relevance order
      return 0;
    } else if (aGradeIndex !== -1 && bGradeIndex === -1) {
      return -1; // Prioritize kits with preferred grades
    } else if (aGradeIndex === -1 && bGradeIndex !== -1) {
      return 1;
    }

    // Both unknown grades - preserve Meilisearch order
    return 0;
  };

  // Within 2010+ kits: prioritize base kits, then variants
  const baseKits2010Plus = kits2010AndAbove.filter((kit) => !kit.baseKitId);
  const variantKits2010Plus = kits2010AndAbove.filter((kit) => kit.baseKitId);

  // Within pre-2010 kits: prioritize base kits, then variants
  const baseKitsPre2010 = kitsBefore2010.filter((kit) => !kit.baseKitId);
  const variantKitsPre2010 = kitsBefore2010.filter((kit) => kit.baseKitId);

  // Within kits without release date: prioritize base kits, then variants
  const baseKitsNoDate = kitsWithoutReleaseDate.filter((kit) => !kit.baseKitId);
  const variantKitsNoDate = kitsWithoutReleaseDate.filter(
    (kit) => kit.baseKitId
  );

  // Combine in priority order, preserving Meilisearch relevance within each category
  const rankedKits = [
    ...baseKits2010Plus.sort(sortByGradePreservingRelevance),
    ...variantKits2010Plus.sort(sortByGradePreservingRelevance),
    ...baseKitsPre2010.sort(sortByGradePreservingRelevance),
    ...variantKitsPre2010.sort(sortByGradePreservingRelevance),
    ...baseKitsNoDate.sort(sortByGradePreservingRelevance),
    ...variantKitsNoDate.sort(sortByGradePreservingRelevance),
  ];

  return rankedKits;
}

interface KitFilters {
  gradeIds?: string[];
  productLineIds?: string[];
  mobileSuitIds?: string[];
  seriesIds?: string[];
  releaseTypeIds?: string[];
  searchTerm?: string;
  sortBy?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

export async function getFilteredKitsWithMeilisearch(filters: KitFilters) {
  try {
    const {
      gradeIds = [],
      productLineIds = [],
      mobileSuitIds = [],
      seriesIds = [],
      releaseTypeIds = [],
      searchTerm = "",
      sortBy = "relevance",
      order = "most-relevant",
      limit = 50,
      offset = 0,
    } = filters;

    const meilisearch = getMeilisearchClient();

    // Check if this is a default view (no search term and no filters)
    const isDefaultView =
      !searchTerm &&
      gradeIds.length === 0 &&
      productLineIds.length === 0 &&
      mobileSuitIds.length === 0 &&
      seriesIds.length === 0 &&
      releaseTypeIds.length === 0;

    // Build Meilisearch filters
    const meilisearchFilters: string[] = [];

    // Grade filters (using productLine.grade.id)
    if (gradeIds.length > 0) {
      const gradeFilters = gradeIds.map(
        (gradeId) => `productLine.grade.id = "${gradeId}"`
      );
      meilisearchFilters.push(`(${gradeFilters.join(" OR ")})`);
    }

    // Product line filters
    if (productLineIds.length > 0) {
      const productLineFilters = productLineIds.map(
        (plId) => `productLine.id = "${plId}"`
      );
      meilisearchFilters.push(`(${productLineFilters.join(" OR ")})`);
    }

    // Mobile suit filters (using mobileSuits.id)
    if (mobileSuitIds.length > 0) {
      const mobileSuitFilters = mobileSuitIds.map(
        (msId) => `mobileSuits.id = "${msId}"`
      );
      meilisearchFilters.push(`(${mobileSuitFilters.join(" OR ")})`);
    }

    // Series filters
    if (seriesIds.length > 0) {
      const seriesFilters = seriesIds.map(
        (seriesId) => `series.id = "${seriesId}"`
      );
      meilisearchFilters.push(`(${seriesFilters.join(" OR ")})`);
    }

    // Release type filters
    if (releaseTypeIds.length > 0) {
      const releaseTypeFilters = releaseTypeIds.map(
        (rtId) => `releaseType.id = "${rtId}"`
      );
      meilisearchFilters.push(`(${releaseTypeFilters.join(" OR ")})`);
    }

    // Handle sorting
    let sortArray: string[] = [];
    if (sortBy === "name") {
      sortArray = order === "ascending" ? ["name:asc"] : ["name:desc"];
    } else if (sortBy === "release-date") {
      sortArray =
        order === "ascending" ? ["releaseDate:asc"] : ["releaseDate:desc"];
    } else if (sortBy === "rating") {
      // For now, use relevance as rating isn't in Meilisearch
      sortArray = [];
    } else {
      // Default to relevance
      sortArray = [];
    }

    // Search kits with custom ranking
    const kitsResponse = await meilisearch.index("kits").search(searchTerm, {
      filter:
        meilisearchFilters.length > 0
          ? meilisearchFilters.join(" AND ")
          : undefined,
      sort: sortArray.length > 0 ? sortArray : undefined,
      limit: limit * 2, // Get more results to re-rank
      offset: offset,
      attributesToRetrieve: [
        "id",
        "name",
        "slug",
        "number",
        "variant",
        "releaseDate",
        "priceYen",
        "boxArt",
        "notes",
        "baseKitId",
        "productLine",
        "series",
        "releaseType",
        "mobileSuits",
        "expansions",
      ],
    });

    let rankedKits: any[];

    if (isDefaultView) {
      // Default view: sort by release date descending, NULL dates last
      rankedKits = rankKitsByReleaseDate(kitsResponse.hits);
    } else if (searchTerm) {
      // Search query: prioritize base kits first, then variants, then expansions last
      // Separate kits into categories
      const baseKits = kitsResponse.hits.filter((kit: any) => {
        // Base kits: no baseKitId and not expansion kits
        return (
          !kit.baseKitId && (!kit.expansions || kit.expansions.length === 0)
        );
      });

      const variantKits = kitsResponse.hits.filter((kit: any) => {
        // Variant kits: have baseKitId but not expansion kits
        return (
          kit.baseKitId && (!kit.expansions || kit.expansions.length === 0)
        );
      });

      const expansionKits = kitsResponse.hits.filter((kit: any) => {
        // Expansion kits: have expansions (regardless of baseKitId)
        return kit.expansions && kit.expansions.length > 0;
      });

      // Rank each category separately, then combine with expansion kits last
      const rankedBaseKits = rankKitsByGradeAndReleaseDate(baseKits);
      const rankedVariantKits = rankKitsByGradeAndReleaseDate(variantKits);
      const rankedExpansionKits = rankKitsByGradeAndReleaseDate(expansionKits);

      rankedKits = [
        ...rankedBaseKits,
        ...rankedVariantKits,
        ...rankedExpansionKits,
      ];
    } else {
      // Filtered view: use existing logic
      const shouldPrioritizeBaseKits = !isVariantSearch(searchTerm);
      rankedKits = rankKitsByBaseKitAndReleaseDate(
        kitsResponse.hits,
        shouldPrioritizeBaseKits
      );
    }

    // Apply limit and offset after ranking
    const paginatedKits = rankedKits.slice(0, limit);

    // Transform kits data to match existing interface
    const transformedKits = paginatedKits.map((kit: any) => ({
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      number: kit.number,
      variant: kit.variant,
      releaseDate: kit.releaseDate ? new Date(kit.releaseDate) : null,
      priceYen: kit.priceYen,
      boxArt: kit.boxArt,
      baseKitId: kit.baseKitId,
      grade: kit.productLine?.grade?.name || null,
      productLine: kit.productLine?.name,
      series: kit.series?.name,
      timeline: kit.series?.timeline?.name,
      releaseType: kit.releaseType?.name,
      mobileSuits: kit.mobileSuits?.map((ms: any) => ms.name) || [],
    }));

    return {
      kits: transformedKits,
      total: kitsResponse.estimatedTotalHits || 0,
      hasMore: offset + limit < (kitsResponse.estimatedTotalHits || 0),
    };
  } catch (error) {
    console.error("Error in getFilteredKitsWithMeilisearch:", error);
    throw new Error("Failed to search kits");
  }
}

// Get filter data for the kits page (grades, product lines, etc.)
export async function getFilterDataWithMeilisearch() {
  try {
    // Get all unique grades, product lines, mobile suits, series, and release types
    // We'll use Meilisearch to get distinct values, but for now use Prisma for filter data
    // since Meilisearch doesn't have a direct way to get distinct values across all documents

    const [grades, productLines, series, releaseTypes] = await Promise.all([
      prisma.grade.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.productLine.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.series.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.releaseType.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      grades,
      productLines,
      series,
      releaseTypes,
    };
  } catch (error) {
    console.error("Error in getFilterDataWithMeilisearch:", error);
    throw new Error("Failed to load filter data");
  }
}
