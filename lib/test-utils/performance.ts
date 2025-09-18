import { prisma } from "./prisma";

export interface PerformanceMetrics {
  queryTime: number;
  resultCount: number;
  memoryUsage?: number;
  indexUsed?: boolean;
}

export interface QueryPlan {
  plan: Record<string, unknown>[];
  executionTime?: number;
  planningTime?: number;
}

/**
 * Measure the performance of a database query
 */
export const measureQueryPerformance = async <T>(
  queryFn: () => Promise<T>,
  options: {
    includeMemoryUsage?: boolean;
    includeQueryPlan?: boolean;
    query?: string;
  } = {}
): Promise<{ result: T; metrics: PerformanceMetrics; queryPlan?: QueryPlan }> => {
  const startTime = process.hrtime.bigint();
  const startMemory = options.includeMemoryUsage ? process.memoryUsage() : undefined;

  let queryPlan: QueryPlan | undefined;
  if (options.includeQueryPlan && options.query) {
    try {
      const plan = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${options.query}`) as Record<string, unknown>[];
      queryPlan = { plan };
    } catch (error) {
      console.warn('Failed to get query plan:', error);
    }
  }

  const result = await queryFn();

  const endTime = process.hrtime.bigint();
  const endMemory = options.includeMemoryUsage ? process.memoryUsage() : undefined;

  const queryTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  const memoryUsage = endMemory && startMemory
    ? endMemory.heapUsed - startMemory.heapUsed
    : undefined;

  const metrics: PerformanceMetrics = {
    queryTime,
    resultCount: Array.isArray(result) ? result.length : 1,
    memoryUsage,
  };

  return { result, metrics, queryPlan };
};

/**
 * Benchmark multiple queries and compare performance
 */
export const benchmarkQueries = async <T>(
  queries: Array<{
    name: string;
    queryFn: () => Promise<T>;
    query?: string;
  }>,
  iterations: number = 1
): Promise<Array<{ name: string; avgTime: number; minTime: number; maxTime: number; results: T[] }>> => {
  const results = [];

  for (const { name, queryFn, query } of queries) {
    const times: number[] = [];
    const queryResults: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const { metrics, result } = await measureQueryPerformance(queryFn, { query });
      times.push(metrics.queryTime);
      queryResults.push(result);
    }

    results.push({
      name,
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      results: queryResults,
    });
  }

  return results;
};

/**
 * Generate realistic test data for performance testing
 */
export const generatePerformanceTestData = {
  async createLargeDataset(config: {
    users: number;
    grades: number;
    series: number;
    kits: number;
    collections: number;
    reviews: number;
    builds: number;
    productLines?: number;
  }) {
    console.log('Generating performance test data...');

    // Create users
    const users = [];
    for (let i = 0; i < config.users; i++) {
      users.push({
        id: `perf-user-${i}`,
        email: `perf-user-${i}@example.com`,
        username: `perfuser${i}`,
        firstName: `Perf${i}`,
        lastName: `User${i}`,
      });
    }
    await prisma.user.createMany({ data: users });
    console.log(`Created ${config.users} users`);

    // Create grades
    const grades = [];
    const gradeNames = ['HG', 'RG', 'MG', 'PG', 'SD', 'RE/100', 'FM', 'EG', 'HGUC', 'MGEX'];
    for (let i = 0; i < config.grades; i++) {
      grades.push({
        name: `${gradeNames[i % gradeNames.length]} ${i}`,
        slug: `${gradeNames[i % gradeNames.length].toLowerCase()}-${i}`,
        description: `Performance test grade ${i}`,
      });
    }
    await prisma.grade.createMany({ data: grades });
    console.log(`Created ${config.grades} grades`);

    // Create series
    const series = [];
    const seriesNames = [
      'Mobile Suit Gundam', 'Zeta Gundam', 'Gundam ZZ', 'Char\'s Counterattack',
      'Gundam Wing', 'Gundam SEED', 'Gundam 00', 'Gundam AGE', 'Gundam Build Fighters',
      'Gundam Iron-Blooded Orphans', 'Gundam Reconguista in G', 'Gundam Unicorn'
    ];
    for (let i = 0; i < config.series; i++) {
      series.push({
        name: `${seriesNames[i % seriesNames.length]} ${i}`,
        slug: `${seriesNames[i % seriesNames.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
        description: `Performance test series ${i}`,
      });
    }
    await prisma.series.createMany({ data: series });
    console.log(`Created ${config.series} series`);

    // Create product lines
    const createdGrades = await prisma.grade.findMany();
    const productLines = [];
    const productLineNames = ['HGUC', 'MG', 'RG', 'PG', 'SD', 'RE/100', 'FM', 'HG'];

    for (let i = 0; i < (config.productLines ?? 8); i++) {
      productLines.push({
        name: `${productLineNames[i % productLineNames.length]} ${i}`,
        slug: `${productLineNames[i % productLineNames.length].toLowerCase()}-${i}`,
        description: `Performance test product line ${i}`,
        gradeId: createdGrades[i % createdGrades.length].id,
      });
    }
    await prisma.productLine.createMany({ data: productLines });
    console.log(`Created ${productLines.length} product lines`);

    // Create kits
    const createdProductLines = await prisma.productLine.findMany();
    const createdSeries = await prisma.series.findMany();

    const kits = [];
    const kitNames = [
      'RX-78-2 Gundam', 'MS-06 Zaku II', 'MS-07 Gouf', 'MS-09 Dom',
      'RX-77-2 Guncannon', 'RX-75 Guntank', 'MS-14 Gelgoog', 'MS-15 Gyan',
      'MS-18E Kämpfer', 'MS-19N Mass Production Type Qubeley', 'RX-93 Nu Gundam',
      'MSN-04 Sazabi', 'RX-0 Unicorn Gundam', 'MSN-06S Sinanju'
    ];

    for (let i = 0; i < config.kits; i++) {
      kits.push({
        name: `${kitNames[i % kitNames.length]} ${i}`,
        slug: `${kitNames[i % kitNames.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
        number: `PERF-${i.toString().padStart(4, '0')}`,
        variant: i % 4 === 0 ? `Ver. ${i}` : null,
        releaseDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1),
        priceYen: 1000 + (i * 50),
        region: i % 3 === 0 ? 'Japan' : i % 3 === 1 ? 'International' : 'Asia',
        productLineId: createdProductLines[i % createdProductLines.length].id,
        seriesId: createdSeries[i % createdSeries.length].id,
      });
    }
    await prisma.kit.createMany({ data: kits });
    console.log(`Created ${config.kits} kits`);

    // Create user collections
    const createdUsers = await prisma.user.findMany();
    const createdKits = await prisma.kit.findMany();

    const collections = [];
    const statuses = ['WISHLIST', 'BACKLOG', 'BUILT'];
    const usedPairs = new Set<string>();

    for (let i = 0; i < config.collections; i++) {
      const userId = createdUsers[i % createdUsers.length].id;
      const kitId = createdKits[i % createdKits.length].id;
      const pairKey = `${userId}-${kitId}`;

      // Skip if this user-kit pair already exists
      if (usedPairs.has(pairKey)) {
        continue;
      }
      usedPairs.add(pairKey);

      collections.push({
        userId,
        kitId,
        status: statuses[i % statuses.length] as 'WISHLIST' | 'BACKLOG' | 'BUILT',
        notes: i % 10 === 0 ? `Performance test collection notes ${i}` : null,
      });
    }
    await prisma.userKitCollection.createMany({ data: collections });
    console.log(`Created ${collections.length} user collections`);

    // Create reviews
    const reviews = [];
    const reviewUsedPairs = new Set<string>();

    for (let i = 0; i < config.reviews; i++) {
      const userId = createdUsers[i % createdUsers.length].id;
      const kitId = createdKits[i % createdKits.length].id;
      const pairKey = `${userId}-${kitId}`;

      // Skip if this user-kit pair already exists
      if (reviewUsedPairs.has(pairKey)) {
        continue;
      }
      reviewUsedPairs.add(pairKey);

      reviews.push({
        userId,
        kitId,
        title: i % 5 === 0 ? `Performance test review ${i}` : null,
        content: i % 3 === 0 ? `This is a performance test review for kit ${i}` : null,
        overallScore: 5 + (i % 5), // Scores from 5 to 9
      });
    }
    await prisma.review.createMany({ data: reviews });
    console.log(`Created ${reviews.length} reviews`);

    // Create builds
    const builds = [];
    const buildStatuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
    for (let i = 0; i < config.builds; i++) {
      builds.push({
        userId: createdUsers[i % createdUsers.length].id,
        kitId: createdKits[i % createdKits.length].id,
        title: `Performance test build ${i}`,
        description: i % 2 === 0 ? `Description for performance test build ${i}` : null,
        status: buildStatuses[i % buildStatuses.length] as 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
        startedAt: i % 3 === 0 ? new Date() : null,
        completedAt: i % 4 === 0 ? new Date() : null,
      });
    }
    await prisma.build.createMany({ data: builds });
    console.log(`Created ${config.builds} builds`);

    console.log('Performance test data generation complete');

    return {
      users: createdUsers,
      grades: createdGrades,
      series: createdSeries,
      kits: createdKits,
    };
  },
};

/**
 * Analyze query performance and provide optimization suggestions
 */
export const analyzeQueryPerformance = (metrics: PerformanceMetrics, queryName: string): string[] => {
  const suggestions: string[] = [];

  if (metrics.queryTime > 100) {
    suggestions.push(`${queryName}: Query time (${metrics.queryTime.toFixed(2)}ms) is slow. Consider adding indexes or optimizing the query.`);
  }

  if (metrics.queryTime > 50 && metrics.resultCount > 100) {
    suggestions.push(`${queryName}: Large result set (${metrics.resultCount} records) with slow query time. Consider pagination or filtering.`);
  }

  if (metrics.memoryUsage && metrics.memoryUsage > 10 * 1024 * 1024) { // 10MB
    suggestions.push(`${queryName}: High memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB). Consider streaming results or reducing data size.`);
  }

  if (metrics.queryTime < 10 && metrics.resultCount > 0) {
    suggestions.push(`${queryName}: Good performance (${metrics.queryTime.toFixed(2)}ms) for ${metrics.resultCount} records.`);
  }

  return suggestions;
};

/**
 * Test index effectiveness by comparing query plans
 */
export const testIndexEffectiveness = async (queries: Array<{ name: string; query: string; expectedIndex?: string }>) => {
  const results = [];

  for (const { name, query, expectedIndex } of queries) {
    try {
      const plan = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${query}`);
      const planText = JSON.stringify(plan);

      const indexUsed = expectedIndex ? planText.includes(expectedIndex) : true;
      const executionTime = planText.match(/Execution Time: ([\d.]+) ms/)?.[1];

      results.push({
        name,
        indexUsed,
        executionTime: executionTime ? parseFloat(executionTime) : null,
        plan,
      });
    } catch (error) {
      results.push({
        name,
        indexUsed: false,
        executionTime: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return results;
};
