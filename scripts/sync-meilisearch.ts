#!/usr/bin/env tsx

import { PrismaClient } from '../generated/prisma';
import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Initialize Meilisearch client
const hostUrl = process.env.MEILI_HOST_URL!.startsWith('http')
  ? process.env.MEILI_HOST_URL!
  : `https://${process.env.MEILI_HOST_URL!}`;

const meilisearch = new MeiliSearch({
  host: hostUrl,
  apiKey: process.env.MEILI_MASTER_KEY!,
});

// Define searchable indexes
const INDEXES = {
  kits: 'kits',
  mobileSuits: 'mobile-suits',
  series: 'series',
  productLines: 'product-lines',
  grades: 'grades',
  users: 'users',
  builds: 'builds',
  reviews: 'reviews',
} as const;

interface SearchableKit {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  releaseDate: string | null;
  priceYen: number | null;
  region: string | null;
  boxArt: string | null;
  notes: string | null;
  potentialBaseKit: string | null;
  baseKitId: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  productLine: {
    id: string;
    name: string;
    slug: string | null;
    grade: {
      id: string;
      name: string;
      slug: string | null;
    };
  } | null;
  series: {
    id: string;
    name: string;
    slug: string | null;
    timeline: {
      id: string;
      name: string;
      slug: string | null;
    } | null;
  } | null;
  releaseType: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mobileSuits: Array<{
    id: string;
    name: string;
    slug: string | null;
  }>;
  // Searchable text fields
  searchableText: string;
}

interface SearchableMobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  scrapedImages: string[];
  createdAt: string;
  updatedAt: string;
  series: {
    id: string;
    name: string;
    slug: string | null;
    timeline: {
      id: string;
      name: string;
      slug: string | null;
    } | null;
  } | null;
  searchableText: string;
}

interface SearchableSeries {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  searchableText: string;
}

interface SearchableProductLine {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  grade: {
    id: string;
    name: string;
    slug: string | null;
  };
  searchableText: string;
}

interface SearchableGrade {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  searchableText: string;
}

interface SearchableUser {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  searchableText: string;
}

interface SearchableBuild {
  id: string;
  title: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  kit: {
    id: string;
    name: string;
    number: string;
    productLine: {
      name: string;
      grade: {
        name: string;
      };
    } | null;
  };
  searchableText: string;
}

interface SearchableReview {
  id: string;
  title: string | null;
  content: string | null;
  overallScore: number;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  kit: {
    id: string;
    name: string;
    number: string;
    productLine: {
      name: string;
      grade: {
        name: string;
      };
    } | null;
  };
  searchableText: string;
}

async function createIndexes() {
  console.log('Creating Meilisearch indexes...');

  for (const [, indexName] of Object.entries(INDEXES)) {
    try {
      await meilisearch.createIndex(indexName);
      console.log(`✅ Created index: ${indexName}`);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'index_already_exists') {
        console.log(`ℹ️  Index already exists: ${indexName}`);
      } else {
        console.error(`❌ Error creating index ${indexName}:`, error);
      }
    }
  }
}

async function configureIndexes() {
  console.log('Configuring index settings...');

  // Configure kits index
  await meilisearch.index(INDEXES.kits).updateSettings({
    searchableAttributes: [
      'name',
      'number',
      'variant',
      'notes',
      'searchableText',
      'productLine.name',
      'productLine.grade.name',
      'series.name',
      'series.timeline.name',
      'releaseType.name',
      'mobileSuits.name'
    ],
    filterableAttributes: [
      'productLine.id',
      'productLine.grade.id',
      'series.id',
      'series.timeline.id',
      'releaseType.id',
      'priceYen',
      'releaseDate',
      'region'
    ],
    sortableAttributes: [
      'name',
      'number',
      'releaseDate',
      'priceYen',
      'createdAt'
    ],
    rankingRules: [
      'words',
      'typo',
      'proximity',
      'attribute',
      'sort',
      'exactness'
    ]
  });

  // Configure mobile suits index
  await meilisearch.index(INDEXES.mobileSuits).updateSettings({
    searchableAttributes: [
      'name',
      'description',
      'searchableText',
      'series.name',
      'series.timeline.name'
    ],
    filterableAttributes: [
      'series.id',
      'series.timeline.id'
    ],
    sortableAttributes: [
      'name',
      'createdAt'
    ]
  });

  // Configure series index
  await meilisearch.index(INDEXES.series).updateSettings({
    searchableAttributes: [
      'name',
      'description',
      'searchableText',
      'timeline.name'
    ],
    filterableAttributes: [
      'timeline.id'
    ],
    sortableAttributes: [
      'name',
      'createdAt'
    ]
  });

  // Configure product lines index
  await meilisearch.index(INDEXES.productLines).updateSettings({
    searchableAttributes: [
      'name',
      'description',
      'searchableText',
      'grade.name'
    ],
    filterableAttributes: [
      'grade.id'
    ],
    sortableAttributes: [
      'name',
      'createdAt'
    ]
  });

  // Configure grades index
  await meilisearch.index(INDEXES.grades).updateSettings({
    searchableAttributes: [
      'name',
      'description',
      'searchableText'
    ],
    sortableAttributes: [
      'name',
      'createdAt'
    ]
  });

  // Configure users index
  await meilisearch.index(INDEXES.users).updateSettings({
    searchableAttributes: [
      'username',
      'firstName',
      'lastName',
      'email',
      'bio',
      'searchableText'
    ],
    filterableAttributes: [
      'id'
    ],
    sortableAttributes: [
      'username',
      'firstName',
      'lastName',
      'createdAt'
    ]
  });

  // Configure builds index
  await meilisearch.index(INDEXES.builds).updateSettings({
    searchableAttributes: [
      'title',
      'description',
      'searchableText',
      'user.username',
      'user.firstName',
      'user.lastName',
      'kit.name',
      'kit.number',
      'kit.productLine.name',
      'kit.productLine.grade.name'
    ],
    filterableAttributes: [
      'user.id',
      'kit.id',
      'status'
    ],
    sortableAttributes: [
      'title',
      'createdAt',
      'updatedAt'
    ]
  });

  // Configure reviews index
  await meilisearch.index(INDEXES.reviews).updateSettings({
    searchableAttributes: [
      'title',
      'content',
      'searchableText',
      'user.username',
      'user.firstName',
      'user.lastName',
      'kit.name',
      'kit.number',
      'kit.productLine.name',
      'kit.productLine.grade.name'
    ],
    filterableAttributes: [
      'user.id',
      'kit.id',
      'overallScore'
    ],
    sortableAttributes: [
      'overallScore',
      'createdAt',
      'updatedAt'
    ]
  });

  console.log('✅ Index settings configured');
}

async function syncKits() {
  console.log('Syncing kits...');

  const kits = await prisma.kit.findMany({
    include: {
      productLine: {
        include: {
          grade: true
        }
      },
      series: {
        include: {
          timeline: true
        }
      },
      releaseType: true,
      mobileSuits: {
        include: {
          mobileSuit: true
        }
      }
    }
  });

  const searchableKits: SearchableKit[] = kits.map(kit => ({
    id: kit.id,
    name: kit.name,
    slug: kit.slug,
    number: kit.number,
    variant: kit.variant,
    releaseDate: kit.releaseDate?.toISOString() || null,
    priceYen: kit.priceYen,
    region: kit.region,
    boxArt: kit.boxArt,
    notes: kit.notes,
    potentialBaseKit: kit.potentialBaseKit,
    baseKitId: kit.baseKitId,
    createdAt: kit.createdAt.toISOString(),
    updatedAt: kit.updatedAt.toISOString(),
    productLine: kit.productLine ? {
      id: kit.productLine.id,
      name: kit.productLine.name,
      slug: kit.productLine.slug,
      grade: {
        id: kit.productLine.grade.id,
        name: kit.productLine.grade.name,
        slug: kit.productLine.grade.slug
      }
    } : null,
    series: kit.series ? {
      id: kit.series.id,
      name: kit.series.name,
      slug: kit.series.slug,
      timeline: kit.series.timeline ? {
        id: kit.series.timeline.id,
        name: kit.series.timeline.name,
        slug: kit.series.timeline.slug
      } : null
    } : null,
    releaseType: kit.releaseType ? {
      id: kit.releaseType.id,
      name: kit.releaseType.name,
      slug: kit.releaseType.slug
    } : null,
    mobileSuits: kit.mobileSuits.map(ks => ({
      id: ks.mobileSuit.id,
      name: ks.mobileSuit.name,
      slug: ks.mobileSuit.slug
    })),
    searchableText: [
      kit.name,
      kit.number,
      kit.variant,
      kit.notes,
      kit.productLine?.name,
      kit.productLine?.grade.name,
      kit.series?.name,
      kit.series?.timeline?.name,
      kit.releaseType?.name,
      ...kit.mobileSuits.map(ks => ks.mobileSuit.name)
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.kits).addDocuments(searchableKits);
  console.log(`✅ Synced ${searchableKits.length} kits`);
}

async function syncMobileSuits() {
  console.log('Syncing mobile suits...');

  const mobileSuits = await prisma.mobileSuit.findMany({
    include: {
      series: {
        include: {
          timeline: true
        }
      }
    }
  });

  const searchableMobileSuits: SearchableMobileSuit[] = mobileSuits.map(ms => ({
    id: ms.id,
    name: ms.name,
    slug: ms.slug,
    description: ms.description,
    scrapedImages: ms.scrapedImages,
    createdAt: ms.createdAt.toISOString(),
    updatedAt: ms.updatedAt.toISOString(),
    series: ms.series ? {
      id: ms.series.id,
      name: ms.series.name,
      slug: ms.series.slug,
      timeline: ms.series.timeline ? {
        id: ms.series.timeline.id,
        name: ms.series.timeline.name,
        slug: ms.series.timeline.slug
      } : null
    } : null,
    searchableText: [
      ms.name,
      ms.description,
      ms.series?.name,
      ms.series?.timeline?.name
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.mobileSuits).addDocuments(searchableMobileSuits);
  console.log(`✅ Synced ${searchableMobileSuits.length} mobile suits`);
}

async function syncSeries() {
  console.log('Syncing series...');

  const series = await prisma.series.findMany({
    include: {
      timeline: true
    }
  });

  const searchableSeries: SearchableSeries[] = series.map(s => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
    timeline: s.timeline ? {
      id: s.timeline.id,
      name: s.timeline.name,
      slug: s.timeline.slug
    } : null,
    searchableText: [
      s.name,
      s.description,
      s.timeline?.name
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.series).addDocuments(searchableSeries);
  console.log(`✅ Synced ${searchableSeries.length} series`);
}

async function syncProductLines() {
  console.log('Syncing product lines...');

  const productLines = await prisma.productLine.findMany({
    include: {
      grade: true
    }
  });

  const searchableProductLines: SearchableProductLine[] = productLines.map(pl => ({
    id: pl.id,
    name: pl.name,
    slug: pl.slug,
    description: pl.description,
    createdAt: pl.createdAt.toISOString(),
    updatedAt: pl.updatedAt.toISOString(),
    grade: {
      id: pl.grade.id,
      name: pl.grade.name,
      slug: pl.grade.slug
    },
    searchableText: [
      pl.name,
      pl.description,
      pl.grade.name
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.productLines).addDocuments(searchableProductLines);
  console.log(`✅ Synced ${searchableProductLines.length} product lines`);
}

async function syncGrades() {
  console.log('Syncing grades...');

  const grades = await prisma.grade.findMany();

  const searchableGrades: SearchableGrade[] = grades.map(g => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
    description: g.description,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    searchableText: [
      g.name,
      g.description
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.grades).addDocuments(searchableGrades);
  console.log(`✅ Synced ${searchableGrades.length} grades`);
}

async function syncUsers() {
  console.log('Syncing users...');

  const users = await prisma.user.findMany();

  const searchableUsers: SearchableUser[] = users.map(u => ({
    id: u.id,
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    bio: u.bio,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    searchableText: [
      u.username,
      u.firstName,
      u.lastName,
      u.email,
      u.bio
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.users).addDocuments(searchableUsers);
  console.log(`✅ Synced ${searchableUsers.length} users`);
}

async function syncBuilds() {
  console.log('Syncing builds...');

  const builds = await prisma.build.findMany({
    include: {
      user: true,
      kit: {
        include: {
          productLine: {
            include: {
              grade: true
            }
          }
        }
      }
    }
  });

  const searchableBuilds: SearchableBuild[] = builds.map(b => ({
    id: b.id,
    title: b.title,
    description: b.description,
    status: b.status,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
    user: {
      id: b.user.id,
      username: b.user.username,
      firstName: b.user.firstName,
      lastName: b.user.lastName
    },
    kit: {
      id: b.kit.id,
      name: b.kit.name,
      number: b.kit.number,
      productLine: b.kit.productLine ? {
        name: b.kit.productLine.name,
        grade: {
          name: b.kit.productLine.grade.name
        }
      } : null
    },
    searchableText: [
      b.title,
      b.description,
      b.user.username,
      b.user.firstName,
      b.user.lastName,
      b.kit.name,
      b.kit.number,
      b.kit.productLine?.name,
      b.kit.productLine?.grade.name
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.builds).addDocuments(searchableBuilds);
  console.log(`✅ Synced ${searchableBuilds.length} builds`);
}

async function syncReviews() {
  console.log('Syncing reviews...');

  const reviews = await prisma.review.findMany({
    include: {
      user: true,
      kit: {
        include: {
          productLine: {
            include: {
              grade: true
            }
          }
        }
      }
    }
  });

  const searchableReviews: SearchableReview[] = reviews.map(r => ({
    id: r.id,
    title: r.title,
    content: r.content,
    overallScore: r.overallScore,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    user: {
      id: r.user.id,
      username: r.user.username,
      firstName: r.user.firstName,
      lastName: r.user.lastName
    },
    kit: {
      id: r.kit.id,
      name: r.kit.name,
      number: r.kit.number,
      productLine: r.kit.productLine ? {
        name: r.kit.productLine.name,
        grade: {
          name: r.kit.productLine.grade.name
        }
      } : null
    },
    searchableText: [
      r.title,
      r.content,
      r.user.username,
      r.user.firstName,
      r.user.lastName,
      r.kit.name,
      r.kit.number,
      r.kit.productLine?.name,
      r.kit.productLine?.grade.name
    ].filter(Boolean).join(' ')
  }));

  await meilisearch.index(INDEXES.reviews).addDocuments(searchableReviews);
  console.log(`✅ Synced ${searchableReviews.length} reviews`);
}

async function main() {
  try {
    console.log('🚀 Starting Meilisearch sync...');

    // Validate environment variables
    if (!process.env.MEILI_HOST_URL || !process.env.MEILI_MASTER_KEY) {
      throw new Error('Missing required environment variables: MEILI_HOST_URL and MEILI_MASTER_KEY');
    }

    // Create indexes
    await createIndexes();

    // Configure index settings
    await configureIndexes();

    // Sync all data
    await syncKits();
    await syncMobileSuits();
    await syncSeries();
    await syncProductLines();
    await syncGrades();
    await syncUsers();
    await syncBuilds();
    await syncReviews();

    console.log('🎉 Meilisearch sync completed successfully!');

  } catch (error) {
    console.error('❌ Error during sync:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main as syncMeilisearch };
