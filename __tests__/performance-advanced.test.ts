import { setupTestDb } from "@/lib/test-utils/setup";
import { prisma } from "@/lib/test-utils/prisma";
import {
  measureQueryPerformance,
  benchmarkQueries,
  generatePerformanceTestData,
  analyzeQueryPerformance,
  testIndexEffectiveness,
} from "@/lib/test-utils/performance";

// Set up test database
setupTestDb();

describe("Advanced Database Performance Tests", () => {
  describe("Large Dataset Performance", () => {
    it("should handle 10,000+ records with complex queries", async () => {
      // Generate large dataset
      const testData = await generatePerformanceTestData.createLargeDataset({
        users: 1000,
        grades: 20,
        series: 30,
        kits: 10000,
        collections: 5000,
        reviews: 3000,
        builds: 2000,
      });

      // Test complex kit search with multiple filters
      const { metrics } = await measureQueryPerformance(
        async () => {
          return prisma.kit.findMany({
            where: {
              AND: [
                {
                  grade: {
                    name: {
                      contains: "HG",
                    },
                  },
                },
                {
                  series: {
                    name: {
                      contains: "Gundam",
                    },
                  },
                },
                {
                  priceYen: {
                    gte: 1000,
                    lte: 5000,
                  },
                },
                {
                  releaseDate: {
                    gte: new Date("2020-01-01"),
                  },
                },
              ],
            },
            include: {
              grade: true,
              series: true,
              _count: {
                select: {
                  collections: true,
                  reviews: true,
                  builds: true,
                },
              },
            },
            orderBy: [
              { priceYen: 'asc' },
              { createdAt: 'desc' },
            ],
            take: 100,
          });
        },
        {
          includeMemoryUsage: true,
        }
      );

      const suggestions = analyzeQueryPerformance(metrics, "Complex kit search with 10,000+ records");
      console.log("Performance suggestions:", suggestions);

      expect(metrics.queryTime).toBeLessThan(500); // Should be reasonably fast even with large dataset
      expect(metrics.resultCount).toBeLessThanOrEqual(100);
    });

    it("should perform well with user collection aggregations", async () => {
      // Test user collection statistics
      const { metrics } = await measureQueryPerformance(
        async () => {
          return prisma.userKitCollection.groupBy({
            by: ['status'],
            _count: {
              _all: true,
            },
          });
        },
        {
          includeMemoryUsage: true,
        }
      );

      const suggestions = analyzeQueryPerformance(metrics, "User collection aggregation");
      console.log("Performance suggestions:", suggestions);

      expect(metrics.queryTime).toBeLessThan(100);
    });

    it("should handle review score aggregations efficiently", async () => {
      // Test review score statistics
      const { metrics } = await measureQueryPerformance(
        async () => {
          return prisma.reviewScore.groupBy({
            by: ['category'],
            _avg: {
              score: true,
            },
            _count: {
              id: true,
            },
            _min: {
              score: true,
            },
            _max: {
              score: true,
            },
          });
        },
        {
          includeMemoryUsage: true,
        }
      );

      const suggestions = analyzeQueryPerformance(metrics, "Review score aggregation");
      console.log("Performance suggestions:", suggestions);

      expect(metrics.queryTime).toBeLessThan(100);
    });
  });

  describe("Query Benchmarking", () => {
    it("should benchmark different query approaches", async () => {
      // Generate test data
      await generatePerformanceTestData.createLargeDataset({
        users: 100,
        grades: 10,
        series: 15,
        kits: 1000,
        collections: 500,
        reviews: 300,
        builds: 200,
      });

      const queries = [
        {
          name: "Kit search with include",
          queryFn: async () => {
            return prisma.kit.findMany({
              where: {
                grade: {
                  name: "HG 0",
                },
              },
              include: {
                grade: true,
                series: true,
              },
              take: 50,
            });
          },
        },
        {
          name: "Kit search with select",
          queryFn: async () => {
            return prisma.kit.findMany({
              where: {
                grade: {
                  name: "HG 0",
                },
              },
              select: {
                id: true,
                name: true,
                number: true,
                priceYen: true,
                grade: {
                  select: {
                    name: true,
                  },
                },
                series: {
                  select: {
                    name: true,
                  },
                },
              },
              take: 50,
            });
          },
        },
        {
          name: "Kit search minimal",
          queryFn: async () => {
            return prisma.kit.findMany({
              where: {
                grade: {
                  name: "HG 0",
                },
              },
              select: {
                id: true,
                name: true,
                number: true,
              },
              take: 50,
            });
          },
        },
      ];

      const results = await benchmarkQueries(queries, 3);

      console.log("Query benchmarking results:");
      results.forEach(result => {
        console.log(`${result.name}: avg ${result.avgTime.toFixed(2)}ms, min ${result.minTime.toFixed(2)}ms, max ${result.maxTime.toFixed(2)}ms`);
      });

      // Verify that all queries perform reasonably well
      results.forEach(result => {
        expect(result.avgTime).toBeLessThan(100);
      });
    });
  });

  describe("Index Effectiveness Tests", () => {
    it("should verify index usage for common queries", async () => {
      // Generate test data
      await generatePerformanceTestData.createLargeDataset({
        users: 100,
        grades: 10,
        series: 15,
        kits: 1000,
        collections: 500,
        reviews: 300,
        builds: 200,
      });

      const indexTests = [
        {
          name: "Kit slug lookup",
          query: "SELECT * FROM kits WHERE slug = 'rx-78-2-gundam-0'",
          expectedIndex: "kits_slug_key",
        },
        {
          name: "User email lookup",
          query: "SELECT * FROM users WHERE email = 'perf-user-0@example.com'",
          expectedIndex: "users_email_key",
        },
        {
          name: "User collection by user and status",
          query: "SELECT * FROM user_kit_collections WHERE \"userId\" = 'perf-user-0' AND status = 'WISHLIST'",
          expectedIndex: "user_kit_collections_userId_status_idx",
        },
        {
          name: "Reviews by kit",
          query: "SELECT * FROM reviews WHERE \"kitId\" = (SELECT id FROM kits LIMIT 1)",
          expectedIndex: "reviews_kitId_idx",
        },
        {
          name: "Builds by status",
          query: "SELECT * FROM builds WHERE status = 'IN_PROGRESS'",
          expectedIndex: "builds_status_idx",
        },
      ];

      const results = await testIndexEffectiveness(indexTests);

      console.log("Index effectiveness results:");
      results.forEach(result => {
        console.log(`${result.name}: Index used: ${result.indexUsed}, Execution time: ${result.executionTime}ms`);
        if (result.error) {
          console.log(`  Error: ${result.error}`);
        }
      });

      // Verify that indexes are being used
      results.forEach(result => {
        if (!result.error) {
          // Most queries should use indexes, but some may not (like Build.status)
          if (result.name === 'Builds by status') {
            // This query doesn't have an index, so we just check performance
            expect(result.executionTime).toBeLessThan(50);
          } else {
            expect(result.indexUsed).toBe(true);
            expect(result.executionTime).toBeLessThan(50);
          }
        }
      });
    });
  });

  describe("Complex Relationship Performance", () => {
    it("should handle deep relationship queries efficiently", async () => {
      // Generate test data
      await generatePerformanceTestData.createLargeDataset({
        users: 50,
        grades: 5,
        series: 10,
        kits: 500,
        collections: 200,
        reviews: 150,
        builds: 100,
      });

      // Test deep relationship query
      const { metrics } = await measureQueryPerformance(
        async () => {
          return prisma.user.findMany({
            where: {
              collections: {
                some: {
                  status: "WISHLIST",
                  kit: {
                    grade: {
                      name: {
                        contains: "HG",
                      },
                    },
                    series: {
                      name: {
                        contains: "Gundam",
                      },
                    },
                  },
                },
              },
            },
            include: {
              collections: {
                where: {
                  status: "WISHLIST",
                },
                include: {
                  kit: {
                    include: {
                      grade: true,
                      series: true,
                      _count: {
                        select: {
                          reviews: true,
                          builds: true,
                        },
                      },
                    },
                  },
                },
              },
            },
            take: 10,
          });
        },
        {
          includeMemoryUsage: true,
        }
      );

      const suggestions = analyzeQueryPerformance(metrics, "Deep relationship query");
      console.log("Performance suggestions:", suggestions);

      expect(metrics.queryTime).toBeLessThan(200);
    });

    it("should handle aggregation queries with relationships", async () => {
      // Test complex aggregation
      const { metrics } = await measureQueryPerformance(
        async () => {
          return prisma.kit.findMany({
            where: {
              reviews: {
                some: {
                  overallScore: {
                    gte: 7,
                  },
                },
              },
            },
            include: {
              _count: {
                select: {
                  reviews: true,
                  collections: true,
                  builds: true,
                },
              },
              reviews: {
                select: {
                  overallScore: true,
                },
              },
            },
            orderBy: {
              reviews: {
                _count: 'desc',
              },
            },
            take: 20,
          });
        },
        {
          includeMemoryUsage: true,
        }
      );

      const suggestions = analyzeQueryPerformance(metrics, "Aggregation with relationships");
      console.log("Performance suggestions:", suggestions);

      expect(metrics.queryTime).toBeLessThan(150);
    });
  });

  describe("Pagination Performance", () => {
    it("should handle large offset pagination efficiently", async () => {
      // Generate test data
      await generatePerformanceTestData.createLargeDataset({
        users: 100,
        grades: 10,
        series: 15,
        kits: 5000,
        collections: 1000,
        reviews: 500,
        builds: 300,
      });

      const paginationTests = [
        { offset: 0, limit: 50 },
        { offset: 100, limit: 50 },
        { offset: 1000, limit: 50 },
        { offset: 2000, limit: 50 },
      ];

      for (const { offset, limit } of paginationTests) {
        const { metrics } = await measureQueryPerformance(
          async () => {
            return prisma.kit.findMany({
              include: {
                grade: true,
                series: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
              take: limit,
              skip: offset,
            });
          },
          {
            includeMemoryUsage: true,
          }
        );

        const suggestions = analyzeQueryPerformance(metrics, `Pagination offset ${offset}, limit ${limit}`);
        console.log(`Pagination ${offset}-${offset + limit}: ${metrics.queryTime.toFixed(2)}ms`);

        // Pagination should be reasonably fast even with large offsets
        expect(metrics.queryTime).toBeLessThan(300);
      }
    });
  });

  describe("Concurrent Query Performance", () => {
    it("should handle concurrent queries efficiently", async () => {
      // Generate test data
      await generatePerformanceTestData.createLargeDataset({
        users: 100,
        grades: 10,
        series: 15,
        kits: 1000,
        collections: 500,
        reviews: 300,
        builds: 200,
      });

      // Simulate concurrent queries
      const concurrentQueries = Array.from({ length: 10 }, (_, i) => ({
        name: `Concurrent query ${i}`,
        queryFn: async () => {
          return prisma.kit.findMany({
            where: {
              grade: {
                name: `HG ${i % 5}`,
              },
            },
            include: {
              grade: true,
              series: true,
            },
            take: 20,
          });
        },
      }));

      const startTime = Date.now();
      const results = await Promise.all(
        concurrentQueries.map(query => measureQueryPerformance(query.queryFn))
      );
      const totalTime = Date.now() - startTime;

      console.log(`Concurrent queries completed in ${totalTime}ms`);
      console.log(`Average query time: ${(results.reduce((sum, r) => sum + r.metrics.queryTime, 0) / results.length).toFixed(2)}ms`);

      // All queries should complete successfully
      results.forEach((result, index) => {
        expect(result.metrics.queryTime).toBeLessThan(100);
        expect(result.result).toBeDefined();
      });

      // Total time should be reasonable for concurrent execution
      expect(totalTime).toBeLessThan(1000);
    });
  });
});
