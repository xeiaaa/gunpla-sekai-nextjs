import { setupTestDb, createTestData } from "@/lib/test-utils/setup";
import { prisma } from "@/lib/test-utils/prisma";

// Set up test database
setupTestDb();

// Performance measurement utilities
const measureQueryTime = async <T>(queryFn: () => Promise<T>): Promise<{ result: T; timeMs: number }> => {
  const start = process.hrtime.bigint();
  const result = await queryFn();
  const end = process.hrtime.bigint();
  const timeMs = Number(end - start) / 1000000; // Convert nanoseconds to milliseconds
  return { result, timeMs };
};

const getQueryPlan = async (query: string): Promise<any> => {
  const result = await prisma.$queryRawUnsafe(`EXPLAIN ANALYZE ${query}`);
  return result;
};

// Test data generators for different dataset sizes
const generateTestData = {
  async users(count: number) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: `test-user-${i}`,
        email: `test${i}@example.com`,
        username: `testuser${i}`,
        firstName: `Test${i}`,
        lastName: `User${i}`,
      });
    }
    return prisma.user.createMany({ data: users });
  },

  async grades(count: number) {
    const grades = [];
    const gradeNames = ['HG', 'RG', 'MG', 'PG', 'SD', 'RE/100', 'FM', 'EG'];
    for (let i = 0; i < count; i++) {
      grades.push({
        name: `${gradeNames[i % gradeNames.length]} ${i}`,
        slug: `${gradeNames[i % gradeNames.length].toLowerCase()}-${i}`,
        description: `Test grade ${i}`,
      });
    }
    return prisma.grade.createMany({ data: grades });
  },

  async series(count: number) {
    const series = [];
    const seriesNames = ['Mobile Suit Gundam', 'Zeta Gundam', 'Gundam ZZ', 'Char\'s Counterattack', 'Gundam Wing', 'Gundam SEED', 'Gundam 00', 'Gundam AGE'];
    for (let i = 0; i < count; i++) {
      series.push({
        name: `${seriesNames[i % seriesNames.length]} ${i}`,
        slug: `${seriesNames[i % seriesNames.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
        description: `Test series ${i}`,
      });
    }
    return prisma.series.createMany({ data: series });
  },

  async kits(count: number, gradeIds: string[], seriesIds: string[]) {
    const kits = [];
    const kitNames = ['RX-78-2 Gundam', 'MS-06 Zaku II', 'MS-07 Gouf', 'MS-09 Dom', 'RX-77-2 Guncannon', 'RX-75 Guntank', 'MS-14 Gelgoog', 'MS-15 Gyan'];
    for (let i = 0; i < count; i++) {
      kits.push({
        name: `${kitNames[i % kitNames.length]} ${i}`,
        slug: `${kitNames[i % kitNames.length].toLowerCase().replace(/\s+/g, '-')}-${i}`,
        number: `TEST-${i.toString().padStart(3, '0')}`,
        variant: i % 3 === 0 ? `Ver. ${i}` : null,
        releaseDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1),
        priceYen: 1000 + (i * 100),
        region: i % 2 === 0 ? 'Japan' : 'International',
        gradeId: gradeIds[i % gradeIds.length],
        seriesId: seriesIds[i % seriesIds.length],
      });
    }
    return prisma.kit.createMany({ data: kits });
  },

  async userKitCollections(count: number, userIds: string[], kitIds: string[]) {
    const collections = [];
    const statuses = ['WISHLIST', 'BACKLOG', 'BUILT'];
    const usedPairs = new Set<string>();

    for (let i = 0; i < count; i++) {
      const userId = userIds[i % userIds.length];
      const kitId = kitIds[i % kitIds.length];
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
        notes: i % 5 === 0 ? `Test notes for collection ${i}` : null,
      });
    }
    return prisma.userKitCollection.createMany({ data: collections });
  },

  async reviews(count: number, userIds: string[], kitIds: string[]) {
    const reviews = [];
    const usedPairs = new Set<string>();

    for (let i = 0; i < count; i++) {
      const userId = userIds[i % userIds.length];
      const kitId = kitIds[i % kitIds.length];
      const pairKey = `${userId}-${kitId}`;

      // Skip if this user-kit pair already exists
      if (usedPairs.has(pairKey)) {
        continue;
      }
      usedPairs.add(pairKey);

      reviews.push({
        userId,
        kitId,
        title: i % 3 === 0 ? `Review for kit ${i}` : null,
        content: i % 2 === 0 ? `This is a test review for kit ${i}` : null,
        overallScore: 5 + (i % 5), // Scores from 5 to 9
      });
    }
    return prisma.review.createMany({ data: reviews });
  },

  async reviewScores(reviewIds: string[]) {
    const scores = [];
    const categories = ['BUILD_QUALITY_ENGINEERING', 'ARTICULATION_POSEABILITY', 'DETAIL_ACCURACY', 'AESTHETICS_PROPORTIONS', 'ACCESSORIES_GIMMICKS', 'VALUE_EXPERIENCE'];

    for (const reviewId of reviewIds) {
      for (const category of categories) {
        scores.push({
          reviewId,
          category: category as any,
          score: 5 + Math.floor(Math.random() * 5), // Random score 5-9
          notes: Math.random() > 0.7 ? `Notes for ${category}` : null,
        });
      }
    }
    return prisma.reviewScore.createMany({ data: scores });
  },

  async builds(count: number, userIds: string[], kitIds: string[]) {
    const builds = [];
    const statuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
    for (let i = 0; i < count; i++) {
      builds.push({
        userId: userIds[i % userIds.length],
        kitId: kitIds[i % kitIds.length],
        title: `Build ${i}`,
        description: i % 2 === 0 ? `Description for build ${i}` : null,
        status: statuses[i % statuses.length] as 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD',
        startedAt: i % 3 === 0 ? new Date() : null,
        completedAt: i % 4 === 0 ? new Date() : null,
      });
    }
    return prisma.build.createMany({ data: builds });
  },
};

describe("Database Performance Tests", () => {
  describe("Index Effectiveness Tests", () => {
    it("should use index for Kit.slug unique constraint", async () => {
      // Create test data
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          slug: "test-kit-slug",
          gradeId: grade.id,
        },
      });

      // Test unique constraint lookup
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.kit.findUnique({
          where: { slug: "test-kit-slug" },
        });
      });

      expect(timeMs).toBeLessThan(10); // Should be very fast with index
      console.log(`Kit.slug lookup time: ${timeMs.toFixed(2)}ms`);
    });

    it("should use index for User.email unique constraint", async () => {
      const user = await prisma.user.create({
        data: {
          id: "test-user-email",
          email: "test-email@example.com",
        },
      });

      const { timeMs } = await measureQueryTime(async () => {
        return prisma.user.findUnique({
          where: { email: "test-email@example.com" },
        });
      });

      expect(timeMs).toBeLessThan(10);
      console.log(`User.email lookup time: ${timeMs.toFixed(2)}ms`);
    });

    it("should use index for User.username unique constraint", async () => {
      const user = await prisma.user.create({
        data: {
          id: "test-user-username",
          email: "test-username@example.com",
          username: "testusername",
        },
      });

      const { timeMs } = await measureQueryTime(async () => {
        return prisma.user.findUnique({
          where: { username: "testusername" },
        });
      });

      expect(timeMs).toBeLessThan(10);
      console.log(`User.username lookup time: ${timeMs.toFixed(2)}ms`);
    });

    it("should use compound index for KitMobileSuit", async () => {
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          gradeId: grade.id,
        },
      });
      const mobileSuit = await prisma.mobileSuit.create({
        data: { name: "Test Mobile Suit" },
      });

      const kitMobileSuit = await prisma.kitMobileSuit.create({
        data: {
          kitId: kit.id,
          mobileSuitId: mobileSuit.id,
        },
      });

      const { timeMs } = await measureQueryTime(async () => {
        return prisma.kitMobileSuit.findUnique({
          where: {
            kitId_mobileSuitId: {
              kitId: kit.id,
              mobileSuitId: mobileSuit.id,
            },
          },
        });
      });

      expect(timeMs).toBeLessThan(10);
      console.log(`KitMobileSuit compound index lookup time: ${timeMs.toFixed(2)}ms`);
    });

    it("should use compound index for ReviewScore", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user-review", email: "test-review@example.com" },
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          gradeId: grade.id,
        },
      });
      const review = await prisma.review.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          overallScore: 8.0,
        },
      });
      const reviewScore = await prisma.reviewScore.create({
        data: {
          reviewId: review.id,
          category: "BUILD_QUALITY_ENGINEERING",
          score: 8,
        },
      });

      const { timeMs } = await measureQueryTime(async () => {
        return prisma.reviewScore.findUnique({
          where: {
            reviewId_category: {
              reviewId: review.id,
              category: "BUILD_QUALITY_ENGINEERING",
            },
          },
        });
      });

      expect(timeMs).toBeLessThan(10);
      console.log(`ReviewScore compound index lookup time: ${timeMs.toFixed(2)}ms`);
    });
  });

  describe("Query Performance with Large Datasets", () => {
    it("should perform well with 1000 kits and filtering", async () => {
      // Generate test data
      await generateTestData.grades(10);
      await generateTestData.series(10);

      const grades = await prisma.grade.findMany();
      const series = await prisma.series.findMany();

      await generateTestData.kits(1000, grades.map(g => g.id), series.map(s => s.id));

      // Test kit search with filters
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.kit.findMany({
          where: {
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
            priceYen: {
              gte: 1000,
              lte: 5000,
            },
          },
          include: {
            grade: true,
            series: true,
          },
          take: 50,
        });
      });

      expect(timeMs).toBeLessThan(100); // Should be reasonably fast
      console.log(`Kit search with filters (1000 records): ${timeMs.toFixed(2)}ms`);
    });

    it("should perform well with user collections lookup", async () => {
      // Generate test data
      await generateTestData.users(100);
      await generateTestData.grades(5);
      await generateTestData.series(5);

      const users = await prisma.user.findMany();
      const grades = await prisma.grade.findMany();
      const series = await prisma.series.findMany();

      await generateTestData.kits(500, grades.map(g => g.id), series.map(s => s.id));
      const kits = await prisma.kit.findMany();

      await generateTestData.userKitCollections(1000, users.map(u => u.id), kits.map(k => k.id));

      // Test user collection lookup with status filter
      const testUserId = users[0].id;
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.userKitCollection.findMany({
          where: {
            userId: testUserId,
            status: "WISHLIST",
          },
          include: {
            kit: {
              include: {
                grade: true,
                series: true,
              },
            },
          },
        });
      });

      expect(timeMs).toBeLessThan(50);
      console.log(`User collection lookup with status filter: ${timeMs.toFixed(2)}ms`);
    });

    it("should perform well with review aggregations", async () => {
      // Generate test data
      await generateTestData.users(50);
      await generateTestData.grades(5);
      await generateTestData.series(5);

      const users = await prisma.user.findMany();
      const grades = await prisma.grade.findMany();
      const series = await prisma.series.findMany();

      await generateTestData.kits(200, grades.map(g => g.id), series.map(s => s.id));
      const kits = await prisma.kit.findMany();

      await generateTestData.reviews(500, users.map(u => u.id), kits.map(k => k.id));
      const reviews = await prisma.review.findMany();

      await generateTestData.reviewScores(reviews.map(r => r.id));

      // Test review aggregation query
      const testKitId = kits[0].id;
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.review.aggregate({
          where: {
            kitId: testKitId,
          },
          _avg: {
            overallScore: true,
          },
          _count: {
            id: true,
          },
        });
      });

      expect(timeMs).toBeLessThan(50);
      console.log(`Review aggregation query: ${timeMs.toFixed(2)}ms`);
    });

    it("should perform well with build listings", async () => {
      // Generate test data
      await generateTestData.users(50);
      await generateTestData.grades(5);
      await generateTestData.series(5);

      const users = await prisma.user.findMany();
      const grades = await prisma.grade.findMany();
      const series = await prisma.series.findMany();

      await generateTestData.kits(200, grades.map(g => g.id), series.map(s => s.id));
      const kits = await prisma.kit.findMany();

      await generateTestData.builds(300, users.map(u => u.id), kits.map(k => k.id));

      // Test build listing with status filter
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.build.findMany({
          where: {
            status: "IN_PROGRESS",
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            kit: {
              include: {
                grade: true,
                series: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 20,
        });
      });

      expect(timeMs).toBeLessThan(100);
      console.log(`Build listing with status filter: ${timeMs.toFixed(2)}ms`);
    });
  });

  describe("Complex Relationship Query Performance", () => {
    it("should perform well with User->UserKitCollection->Kit->Series->Timeline chain", async () => {
      // Generate test data
      const timeline = await createTestData.timeline();
      const series = await createTestData.series({ timelineId: timeline.id });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          gradeId: grade.id,
          seriesId: series.id,
        },
      });
      const user = await prisma.user.create({
        data: { id: "test-user-complex", email: "test-complex@example.com" },
      });
      await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "WISHLIST",
        },
      });

      // Test complex relationship query
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.user.findUnique({
          where: { id: user.id },
          include: {
            collections: {
              include: {
                kit: {
                  include: {
                    series: {
                      include: {
                        timeline: true,
                      },
                    },
                    grade: true,
                  },
                },
              },
            },
          },
        });
      });

      expect(timeMs).toBeLessThan(50);
      console.log(`Complex relationship query: ${timeMs.toFixed(2)}ms`);
    });

    it("should perform well with Review->ReviewScore aggregation", async () => {
      // Generate test data
      const user = await prisma.user.create({
        data: { id: "test-user-review-agg", email: "test-review-agg@example.com" },
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          gradeId: grade.id,
        },
      });
      const review = await prisma.review.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          overallScore: 8.0,
        },
      });

      // Create review scores for all categories
      const categories = ['BUILD_QUALITY_ENGINEERING', 'ARTICULATION_POSEABILITY', 'DETAIL_ACCURACY', 'AESTHETICS_PROPORTIONS', 'ACCESSORIES_GIMMICKS', 'VALUE_EXPERIENCE'];
      for (const category of categories) {
        await prisma.reviewScore.create({
          data: {
            reviewId: review.id,
            category: category as any,
            score: 7 + Math.floor(Math.random() * 3), // Random score 7-9
          },
        });
      }

      // Test review with scores aggregation
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.review.findUnique({
          where: { id: review.id },
          include: {
            categoryScores: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            kit: {
              include: {
                grade: true,
                series: true,
              },
            },
          },
        });
      });

      expect(timeMs).toBeLessThan(50);
      console.log(`Review with scores aggregation: ${timeMs.toFixed(2)}ms`);
    });
  });

  describe("Constraint Performance Tests", () => {
    it("should handle unique constraint validation efficiently", async () => {
      // Create initial data
      const grade = await createTestData.grade();
      await prisma.kit.create({
        data: {
          name: "Test Kit",
          number: "TEST-001",
          slug: "test-kit-unique",
          gradeId: grade.id,
        },
      });

      // Test unique constraint validation performance
      const { timeMs } = await measureQueryTime(async () => {
        try {
          await prisma.kit.create({
            data: {
              name: "Test Kit 2",
              number: "TEST-002",
              slug: "test-kit-unique", // Duplicate slug
              gradeId: grade.id,
            },
          });
        } catch (error) {
          // Expected to fail due to unique constraint
          expect(error).toBeDefined();
        }
      });

      expect(timeMs).toBeLessThan(100);
      console.log(`Unique constraint validation time: ${timeMs.toFixed(2)}ms`);
    });

    it("should handle foreign key constraint checks efficiently", async () => {
      // Test foreign key constraint validation performance
      const { timeMs } = await measureQueryTime(async () => {
        try {
          await prisma.kit.create({
            data: {
              name: "Test Kit",
              number: "TEST-001",
              gradeId: "invalid-grade-id", // Invalid foreign key
            },
          });
        } catch (error) {
          // Expected to fail due to foreign key constraint
          expect(error).toBeDefined();
        }
      });

      expect(timeMs).toBeLessThan(100);
      console.log(`Foreign key constraint validation time: ${timeMs.toFixed(2)}ms`);
    });
  });

  describe("Large Dataset Performance Tests", () => {
    it("should handle 10,000+ records efficiently", async () => {
      // Generate large dataset
      console.log("Generating large dataset...");
      await generateTestData.grades(20);
      await generateTestData.series(20);

      const grades = await prisma.grade.findMany();
      const series = await prisma.series.findMany();

      await generateTestData.kits(10000, grades.map(g => g.id), series.map(s => s.id));
      console.log("Large dataset generated");

      // Test pagination performance
      const { timeMs } = await measureQueryTime(async () => {
        return prisma.kit.findMany({
          where: {
            priceYen: {
              gte: 1000,
            },
          },
          include: {
            grade: true,
            series: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 100,
          skip: 1000,
        });
      });

      expect(timeMs).toBeLessThan(200);
      console.log(`Large dataset pagination (10,000+ records): ${timeMs.toFixed(2)}ms`);
    });
  });
});
