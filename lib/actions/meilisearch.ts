"use server";

import { MeiliSearch } from 'meilisearch';
import { prisma } from '@/lib/prisma';

// Initialize Meilisearch client
function getMeilisearchClient() {
  const hostUrl = process.env.MEILI_HOST_URL?.startsWith('http')
    ? process.env.MEILI_HOST_URL
    : `https://${process.env.MEILI_HOST_URL}`;

  if (!hostUrl || !process.env.MEILI_MASTER_KEY) {
    throw new Error('Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY');
  }

  return new MeiliSearch({
    host: hostUrl,
    apiKey: process.env.MEILI_MASTER_KEY,
  });
}

function isVariantSearch(query: string): boolean {
  const variantKeywords = [
    'metallic', 'clear', 'ver', 'version', 'variant', 'custom', 'special',
    'plated', 'titanium', 'pearl', 'chrome', 'gold', 'silver', 'transparent',
    'expansion', 'unit', 'armor', 'weapon', 'accessory'
  ];

  const lowerQuery = query.toLowerCase();
  return variantKeywords.some(keyword => lowerQuery.includes(keyword));
}

function rankKitsByBaseKitAndReleaseDate(kits: any[], shouldPrioritizeBaseKits: boolean): any[] {
  // Define grade priority order
  const gradePriority = ['pg', 'mg', 'rg', 'hg', 'eg', 'fm'];

  if (!shouldPrioritizeBaseKits) {
    // Even when not prioritizing base kits, still prioritize by release date and grade
    // but preserve Meilisearch relevance order within same categories
    return kits
      .sort((a, b) => {
        // Prioritize kits released 2010 and above
        const aReleaseYear = a.releaseDate ? new Date(a.releaseDate).getFullYear() : null;
        const bReleaseYear = b.releaseDate ? new Date(b.releaseDate).getFullYear() : null;

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
      })
      .slice(0, 8);
  }

  // Separate kits by release date first, then by base kit status
  const kits2010AndAbove = kits.filter(kit => {
    if (!kit.releaseDate) return false;
    const releaseYear = new Date(kit.releaseDate).getFullYear();
    return releaseYear >= 2010;
  });

  const kitsBefore2010 = kits.filter(kit => {
    if (!kit.releaseDate) return false; // Exclude kits without release date from pre-2010
    const releaseYear = new Date(kit.releaseDate).getFullYear();
    return releaseYear < 2010;
  });

  const kitsWithoutReleaseDate = kits.filter(kit => !kit.releaseDate);

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
  const baseKits2010Plus = kits2010AndAbove.filter(kit => !kit.baseKitId);
  const variantKits2010Plus = kits2010AndAbove.filter(kit => kit.baseKitId);

  // Within pre-2010 kits: prioritize base kits, then variants
  const baseKitsPre2010 = kitsBefore2010.filter(kit => !kit.baseKitId);
  const variantKitsPre2010 = kitsBefore2010.filter(kit => kit.baseKitId);

  // Within kits without release date: prioritize base kits, then variants
  const baseKitsNoDate = kitsWithoutReleaseDate.filter(kit => !kit.baseKitId);
  const variantKitsNoDate = kitsWithoutReleaseDate.filter(kit => kit.baseKitId);

  // Combine in priority order, preserving Meilisearch relevance within each category
  const rankedKits = [
    ...baseKits2010Plus.sort(sortByGradePreservingRelevance),
    ...variantKits2010Plus.sort(sortByGradePreservingRelevance),
    ...baseKitsPre2010.sort(sortByGradePreservingRelevance),
    ...variantKitsPre2010.sort(sortByGradePreservingRelevance),
    ...baseKitsNoDate.sort(sortByGradePreservingRelevance),
    ...variantKitsNoDate.sort(sortByGradePreservingRelevance)
  ];

  return rankedKits.slice(0, 8);
}

interface SearchFilters {
  timeline: string;
  grade: string;
  sortBy: string;
}

interface SearchResult {
  kits: any[];
  mobileSuits: any[];
  totalKits: number;
  totalMobileSuits: number;
  hasMore: boolean;
}

export async function searchKitsAndMobileSuitsWithMeilisearch(
  query: string,
  filters: SearchFilters
): Promise<SearchResult> {
  try {
    if (!query.trim()) {
      return {
        kits: [],
        mobileSuits: [],
        totalKits: 0,
        totalMobileSuits: 0,
        hasMore: false,
      };
    }

    // Build filter array for Meilisearch
    const meilisearchFilters: string[] = [];

    if (filters.timeline !== "all") {
      // Get the actual timeline ID from the database
      const timeline = await prisma.timeline.findUnique({
        where: { slug: filters.timeline },
        select: { id: true }
      });

      if (timeline) {
        meilisearchFilters.push(`series.timeline.id = "${timeline.id}"`);
      }
    }

    if (filters.grade !== "all") {
      // Get the actual grade ID from the database
      const grade = await prisma.grade.findUnique({
        where: { slug: filters.grade },
        select: { id: true }
      });

      if (grade) {
        meilisearchFilters.push(`productLine.grade.id = "${grade.id}"`);
      }
    }

    // Build sort array for Meilisearch
    let sortArray: string[] = [];

    switch (filters.sortBy) {
      case "name-asc":
        sortArray = ["name:asc"];
        break;
      case "name-desc":
        sortArray = ["name:desc"];
        break;
      case "release-desc":
        sortArray = ["releaseDate:desc"];
        break;
      case "release-asc":
        sortArray = ["releaseDate:asc"];
        break;
      case "price-asc":
        sortArray = ["priceYen:asc"];
        break;
      case "price-desc":
        sortArray = ["priceYen:desc"];
        break;
      default: // relevance
        // Meilisearch will handle relevance sorting by default
        sortArray = [];
    }

    const meilisearch = getMeilisearchClient();

    // Determine if we should prioritize base kits (kits without baseKitId)
    const shouldPrioritizeBaseKits = !isVariantSearch(query);

    // Search kits with custom ranking
    const kitsResponse = await meilisearch.index('kits').search(query, {
      filter: meilisearchFilters.length > 0 ? meilisearchFilters.join(' AND ') : undefined,
      sort: sortArray.length > 0 ? sortArray : undefined,
      limit: shouldPrioritizeBaseKits ? 50 : 30, // Get more results to re-rank by release date
      attributesToRetrieve: [
        'id',
        'name',
        'slug',
        'number',
        'variant',
        'releaseDate',
        'priceYen',
        'boxArt',
        'notes',
        'baseKitId',
        'productLine',
        'series',
        'releaseType',
        'mobileSuits'
      ]
    });

    // Search mobile suits
    const mobileSuitsFilters: string[] = [];
    if (filters.timeline !== "all") {
      const timeline = await prisma.timeline.findUnique({
        where: { slug: filters.timeline },
        select: { id: true }
      });

      if (timeline) {
        mobileSuitsFilters.push(`series.timeline.id = "${timeline.id}"`);
      }
    }

    const mobileSuitsResponse = await meilisearch.index('mobile-suits').search(query, {
      filter: mobileSuitsFilters.length > 0 ? mobileSuitsFilters.join(' AND ') : undefined,
      limit: 8,
      attributesToRetrieve: [
        'id',
        'name',
        'slug',
        'description',
        'scrapedImages',
        'series'
      ]
    });

    // Apply custom ranking to prioritize base kits and 2010+ release dates
    const rankedKits = rankKitsByBaseKitAndReleaseDate(kitsResponse.hits, shouldPrioritizeBaseKits);

    // Transform kits data to match existing interface
    const transformedKits = rankedKits.map((kit: any) => ({
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
      mobileSuits: kit.mobileSuits?.map((ms: any) => ms.name) || [],
    }));

    // Transform mobile suits data to match existing interface
    const transformedMobileSuits = mobileSuitsResponse.hits.map((ms: any) => ({
      id: ms.id,
      name: ms.name,
      slug: ms.slug,
      description: ms.description,
      series: ms.series?.name,
      timeline: ms.series?.timeline?.name,
      kitsCount: 0, // Not included in Meilisearch index
      scrapedImages: ms.scrapedImages || [],
    }));

    return {
      kits: transformedKits,
      mobileSuits: transformedMobileSuits,
      totalKits: kitsResponse.estimatedTotalHits,
      totalMobileSuits: mobileSuitsResponse.estimatedTotalHits,
      hasMore: kitsResponse.estimatedTotalHits > 8 || mobileSuitsResponse.estimatedTotalHits > 8,
    };
  } catch (error) {
    console.error('Error searching with Meilisearch:', error);

    // Fallback to database search if Meilisearch fails
    const { searchKitsAndMobileSuits } = await import('./search');
    return searchKitsAndMobileSuits(query, filters);
  }
}

export async function searchMobileSuitsWithMeilisearch(query: string, limit: number = 20) {
  try {
    if (!query.trim()) {
      return [];
    }

    const meilisearch = getMeilisearchClient();

    const mobileSuitsResponse = await meilisearch.index('mobile-suits').search(query, {
      limit,
      attributesToRetrieve: [
        'id',
        'name',
        'slug',
        'description',
        'scrapedImages',
        'series'
      ]
    });

    // Transform mobile suits data to match existing interface
    const transformedMobileSuits = mobileSuitsResponse.hits.map((ms: any) => ({
      id: ms.id,
      name: ms.name,
      slug: ms.slug,
      description: ms.description,
      series: ms.series?.name,
      timeline: ms.series?.timeline?.name,
      kitsCount: 0, // Not included in Meilisearch index
      scrapedImages: ms.scrapedImages || [],
    }));

    return transformedMobileSuits;
  } catch (error) {
    console.error('Error searching mobile suits with Meilisearch:', error);
    return [];
  }
}

export async function searchKitsWithMeilisearch(query: string, limit: number = 20) {
  try {
    if (!query.trim()) {
      return [];
    }

    const meilisearch = getMeilisearchClient();

    const kitsResponse = await meilisearch.index('kits').search(query, {
      limit,
      attributesToRetrieve: [
        'id',
        'name',
        'slug',
        'number',
        'variant',
        'releaseDate',
        'priceYen',
        'boxArt',
        'baseKitId',
        'productLine',
        'series',
        'releaseType',
        'mobileSuits'
      ]
    });

    // Transform kits data to match existing interface
    const transformedKits = kitsResponse.hits.map((kit: any) => ({
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
      releaseType: kit.releaseType?.name,
      mobileSuits: kit.mobileSuits?.map((ms: any) => ms.name) || [],
    }));

    return transformedKits;
  } catch (error) {
    console.error('Error searching kits with Meilisearch:', error);
    return [];
  }
}

export async function getSearchSuggestionsWithMeilisearch(query: string): Promise<string[]> {
  try {
    if (query.length < 2) {
      return [];
    }

    const meilisearch = getMeilisearchClient();

    // Search for suggestions in kits
    const kitsResponse = await meilisearch.index('kits').search(query, {
      limit: 5,
      attributesToRetrieve: ['name']
    });

    // Search for suggestions in mobile suits
    const mobileSuitsResponse = await meilisearch.index('mobile-suits').search(query, {
      limit: 5,
      attributesToRetrieve: ['name']
    });

    // Combine and deduplicate suggestions
    const allSuggestions = [
      ...kitsResponse.hits.map((kit: any) => kit.name),
      ...mobileSuitsResponse.hits.map((ms: any) => ms.name),
    ];

    // Remove duplicates and limit to 5
    const uniqueSuggestions = Array.from(new Set(allSuggestions)).slice(0, 5);

    return uniqueSuggestions;
  } catch (error) {
    console.error('Error getting search suggestions with Meilisearch:', error);

    // Fallback to database search if Meilisearch fails
    const { getSearchSuggestions } = await import('./search');
    return getSearchSuggestions(query);
  }
}

// Get filter options from Meilisearch indexes
export async function getFilterOptions() {
  try {
    const meilisearch = getMeilisearchClient();

    // Get all timelines from series index
    const seriesResponse = await meilisearch.index('series').search('', {
      limit: 1000,
      attributesToRetrieve: ['timeline']
    });

    const timelineMap = new Map();
    seriesResponse.hits
      .map((series: any) => series.timeline)
      .filter(Boolean)
      .forEach((timeline: any) => {
        if (timeline.slug && !timelineMap.has(timeline.slug)) {
          timelineMap.set(timeline.slug, {
            value: timeline.slug,
            label: timeline.name
          });
        }
      });

    const timelines = Array.from(timelineMap.values());

    // Get all grades from product lines index
    const productLinesResponse = await meilisearch.index('product-lines').search('', {
      limit: 1000,
      attributesToRetrieve: ['grade']
    });

    const gradeMap = new Map();
    productLinesResponse.hits
      .map((pl: any) => pl.grade)
      .filter(Boolean)
      .forEach((grade: any) => {
        if (grade.slug && !gradeMap.has(grade.slug)) {
          gradeMap.set(grade.slug, {
            value: grade.slug,
            label: grade.name
          });
        }
      });

    const grades = Array.from(gradeMap.values());

    return {
      timelines: [
        { value: "all", label: "All Timelines" },
        ...timelines
      ],
      grades: [
        { value: "all", label: "All Grades" },
        ...grades
      ]
    };
  } catch (error) {
    console.error('Error getting filter options from Meilisearch:', error);

    // Return default options if Meilisearch fails
    return {
      timelines: [
        { value: "all", label: "All Timelines" },
        { value: "universal-century", label: "Universal Century" },
        { value: "after-colony", label: "After Colony" },
        { value: "cosmic-era", label: "Cosmic Era" },
        { value: "anno-domini", label: "Anno Domini" },
        { value: "advanced-generation", label: "Advanced Generation" },
        { value: "regild-century", label: "Regild Century" },
        { value: "post-disaster", label: "Post Disaster" },
        { value: "ad-stella", label: "Ad Stella" }
      ],
      grades: [
        { value: "all", label: "All Grades" },
        { value: "hg", label: "HG (High Grade)" },
        { value: "rg", label: "RG (Real Grade)" },
        { value: "mg", label: "MG (Master Grade)" },
        { value: "pg", label: "PG (Perfect Grade)" },
        { value: "sd", label: "SD (Super Deformed)" },
        { value: "mega", label: "MEGA SIZE" },
        { value: "entry", label: "Entry Grade" }
      ]
    };
  }
}
