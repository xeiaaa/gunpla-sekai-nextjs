'use server';

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
    'sd', 'hg', 'mg', 'rg', 'pg', 're', 'mega', 'perfect', 'real', 'entry'
  ];

  const lowerQuery = query.toLowerCase();
  return variantKeywords.some(keyword => lowerQuery.includes(keyword));
}

function rankKitsByBaseKit(kits: any[], shouldPrioritizeBaseKits: boolean): any[] {
  if (!shouldPrioritizeBaseKits) {
    return kits; // Return as-is if not prioritizing base kits
  }

  // Separate base kits (no baseKitId) from variant kits (has baseKitId)
  const baseKits = kits.filter(kit => !kit.baseKitId);
  const variantKits = kits.filter(kit => kit.baseKitId);

  // Prioritize base kits, then add variant kits to fill remaining slots
  const rankedKits = [...baseKits, ...variantKits];

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
      searchTerm = '',
      sortBy = 'relevance',
      order = 'most-relevant',
      limit = 50,
      offset = 0
    } = filters;

    const meilisearch = getMeilisearchClient();

    // Build Meilisearch filters
    const meilisearchFilters: string[] = [];

    // Grade filters (using productLine.grade.id)
    if (gradeIds.length > 0) {
      const gradeFilters = gradeIds.map(gradeId => `productLine.grade.id = "${gradeId}"`);
      meilisearchFilters.push(`(${gradeFilters.join(' OR ')})`);
    }

    // Product line filters
    if (productLineIds.length > 0) {
      const productLineFilters = productLineIds.map(plId => `productLine.id = "${plId}"`);
      meilisearchFilters.push(`(${productLineFilters.join(' OR ')})`);
    }

    // Mobile suit filters (using mobileSuits.id)
    if (mobileSuitIds.length > 0) {
      const mobileSuitFilters = mobileSuitIds.map(msId => `mobileSuits.id = "${msId}"`);
      meilisearchFilters.push(`(${mobileSuitFilters.join(' OR ')})`);
    }

    // Series filters
    if (seriesIds.length > 0) {
      const seriesFilters = seriesIds.map(seriesId => `series.id = "${seriesId}"`);
      meilisearchFilters.push(`(${seriesFilters.join(' OR ')})`);
    }

    // Release type filters
    if (releaseTypeIds.length > 0) {
      const releaseTypeFilters = releaseTypeIds.map(rtId => `releaseType.id = "${rtId}"`);
      meilisearchFilters.push(`(${releaseTypeFilters.join(' OR ')})`);
    }

    // Handle sorting
    let sortArray: string[] = [];
    if (sortBy === 'name') {
      sortArray = order === 'ascending' ? ['name:asc'] : ['name:desc'];
    } else if (sortBy === 'release-date') {
      sortArray = order === 'ascending' ? ['releaseDate:asc'] : ['releaseDate:desc'];
    } else if (sortBy === 'rating') {
      // For now, use relevance as rating isn't in Meilisearch
      sortArray = [];
    } else {
      // Default to relevance
      sortArray = [];
    }

    // Determine if we should prioritize base kits
    const shouldPrioritizeBaseKits = !isVariantSearch(searchTerm);

    // Search kits with custom ranking
    const kitsResponse = await meilisearch.index('kits').search(searchTerm, {
      filter: meilisearchFilters.length > 0 ? meilisearchFilters.join(' AND ') : undefined,
      sort: sortArray.length > 0 ? sortArray : undefined,
      limit: shouldPrioritizeBaseKits ? Math.min(limit * 2, 100) : limit, // Get more results to re-rank
      offset: offset,
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

    // Apply custom ranking to prioritize base kits
    const rankedKits = rankKitsByBaseKit(kitsResponse.hits, shouldPrioritizeBaseKits);

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
      hasMore: (offset + limit) < (kitsResponse.estimatedTotalHits || 0)
    };

  } catch (error) {
    console.error('Error in getFilteredKitsWithMeilisearch:', error);
    throw new Error('Failed to search kits');
  }
}

// Get filter data for the kits page (grades, product lines, etc.)
export async function getFilterDataWithMeilisearch() {
  try {
    const meilisearch = getMeilisearchClient();

    // Get all unique grades, product lines, mobile suits, series, and release types
    // We'll use Meilisearch to get distinct values, but for now use Prisma for filter data
    // since Meilisearch doesn't have a direct way to get distinct values across all documents

    const [grades, productLines, mobileSuits, series, releaseTypes] = await Promise.all([
      prisma.grade.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.productLine.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.mobileSuit.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.series.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      }),
      prisma.releaseType.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' }
      })
    ]);

    return {
      grades,
      productLines,
      mobileSuits,
      series,
      releaseTypes
    };

  } catch (error) {
    console.error('Error in getFilterDataWithMeilisearch:', error);
    throw new Error('Failed to load filter data');
  }
}
