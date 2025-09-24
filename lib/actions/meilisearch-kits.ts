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
  includeExpansions?: boolean;
  includeVariants?: boolean;
}

interface MeilisearchKit {
  id: string;
  name: string;
  slug: string;
  number: string;
  variant?: string | null;
  releaseDate?: string | null;
  priceYen?: number | null;
  boxArt?: string | null;
  baseKitId?: string | null;
  productLine?: {
    id: string;
    name: string;
    grade?: {
      name: string;
    };
  };
  series?: {
    name: string;
    timeline?: {
      name: string;
    };
  };
  releaseType?: {
    name: string;
  };
  mobileSuits?: Array<{
    name: string;
  }>;
}

export async function getFilteredKitsWithMeilisearch(filters: KitFilters) {
  try {
    const {
      searchTerm = "",
      limit = 50,
      offset = 0,
      gradeIds = [],
      productLineIds = [],
      mobileSuitIds = [],
      seriesIds = [],
      releaseTypeIds = [],
      includeVariants = true, // Default to true
      includeExpansions = false, // Default to false
      sortBy = "relevance",
      order = "most-relevant",
    } = filters;

    // Decode the search term in case it's URL encoded
    const decodedSearchTerm = decodeURIComponent(searchTerm);

    console.log("🔍 Meilisearch search called with:", {
      originalSearchTerm: searchTerm,
      decodedSearchTerm,
      filters,
    });

    const meilisearch = getMeilisearchClient();

    // Build Meilisearch filters
    const meilisearchFilters: string[] = [];

    if (gradeIds.length > 0) {
      meilisearchFilters.push(
        `productLine.grade.id IN [${gradeIds
          .map((id) => `"${id}"`)
          .join(", ")}]`
      );
    }

    if (productLineIds.length > 0) {
      meilisearchFilters.push(
        `productLine.id IN [${productLineIds
          .map((id) => `"${id}"`)
          .join(", ")}]`
      );
    }

    if (seriesIds.length > 0) {
      meilisearchFilters.push(
        `series.id IN [${seriesIds.map((id) => `"${id}"`).join(", ")}]`
      );
    }

    if (releaseTypeIds.length > 0) {
      meilisearchFilters.push(
        `releaseType.id IN [${releaseTypeIds
          .map((id) => `"${id}"`)
          .join(", ")}]`
      );
    }

    if (mobileSuitIds.length > 0) {
      // Note: mobileSuits might not be directly filterable, we may need to handle this differently
      console.log(
        "Note: mobileSuitIds filter not implemented - mobileSuits may not be filterable"
      );
    }

    // Handle variants and expansions
    if (!includeVariants) {
      // Filter out variants - variants have a baseKitId, base kits have baseKitId = null
      meilisearchFilters.push("baseKitId IS NULL");
    }

    if (!includeExpansions) {
      meilisearchFilters.push("isExpansion = false");
    }

    // Build sort options
    let sortOptions: string[] = [];
    if (sortBy === "name") {
      sortOptions = [`name:${order === "ascending" ? "asc" : "desc"}`];
    } else if (sortBy === "release-date") {
      sortOptions = [`releaseDate:${order === "ascending" ? "asc" : "desc"}`];
    } else if (sortBy === "rating") {
      // Note: Rating sorting might not be available in current Meilisearch index
      // For now, fall back to relevance sorting
      console.log("Rating sorting not implemented - falling back to relevance");
      sortOptions = [];
    } else {
      // Default relevance sorting - let Meilisearch handle it
      sortOptions = [];
    }

    // Search options
    const searchOptions: {
      limit: number;
      offset: number;
      filter?: string;
      sort?: string[];
    } = {
      limit,
      offset,
      filter:
        meilisearchFilters.length > 0
          ? meilisearchFilters.join(" AND ")
          : undefined,
      sort: sortOptions.length > 0 ? sortOptions : undefined,
    };

    console.log("Meilisearch search options:", searchOptions);

    // Search kits with filters
    const kitsResponse = await meilisearch
      .index("kits")
      .search(decodedSearchTerm, searchOptions);

    console.log("------==============----------");
    console.log("Original search term:", searchTerm);
    console.log("Decoded search term:", decodedSearchTerm);
    console.log("Applied filters:", meilisearchFilters);
    console.log(
      "Results:",
      kitsResponse.hits.map(
        (kit) =>
          (kit as MeilisearchKit).name + " - " + (kit as MeilisearchKit).slug
      )
    );
    console.log("------==============----------");

    // Use Meilisearch results directly
    const kits = kitsResponse.hits;

    // Transform data - use whatever fields are available from Meilisearch
    const transformedKits = kits.map((kit) => {
      const typedKit = kit as MeilisearchKit;
      return {
        id: typedKit.id,
        name: typedKit.name,
        slug: typedKit.slug,
        number: typedKit.number,
        variant: typedKit.variant,
        releaseDate: typedKit.releaseDate
          ? new Date(typedKit.releaseDate)
          : null,
        priceYen: typedKit.priceYen,
        boxArt: typedKit.boxArt,
        baseKitId: typedKit.baseKitId,
        grade: typedKit.productLine?.grade?.name || null,
        productLine: typedKit.productLine?.name,
        series: typedKit.series?.name,
        timeline: typedKit.series?.timeline?.name,
        releaseType: typedKit.releaseType?.name,
        mobileSuits: typedKit.mobileSuits?.map((ms) => ms.name) || [],
      };
    });

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
