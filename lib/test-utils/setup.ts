import { testDb } from "./prisma";

// Global test setup and teardown
export const setupTestDb = () => {
  beforeAll(async () => {
    await testDb.connect();
  });

  beforeEach(async () => {
    await testDb.clean();
  });

  afterAll(async () => {
    await testDb.disconnect();
  });
};

// Helper function to create test data
export const createTestData = {
  // Create a test user
  async user(overrides: any = {}) {
    const { prisma } = await import("./prisma");
    return prisma.user.create({
      data: {
        id: "test-user-1",
        email: "test@example.com",
        ...overrides,
      },
    });
  },

  // Create a test grade
  async grade(overrides: any = {}) {
    const { prisma } = await import("./prisma");
    return prisma.grade.create({
      data: {
        name: "HG",
        slug: "hg",
        ...overrides,
      },
    });
  },

  // Create a test kit
  async kit(overrides: any = {}) {
    const { prisma } = await import("./prisma");
    return prisma.kit.create({
      data: {
        name: "Test Kit",
        number: "TEST-001",
        gradeId: "test-grade-id", // This will need to be set properly
        ...overrides,
      },
    });
  },

  // Create a test timeline
  async timeline(overrides: any = {}) {
    const { prisma } = await import("./prisma");
    return prisma.timeline.create({
      data: {
        name: "Test Timeline",
        slug: "test-timeline",
        ...overrides,
      },
    });
  },

  // Create a test series
  async series(overrides: any = {}) {
    const { prisma } = await import("./prisma");
    return prisma.series.create({
      data: {
        name: "Test Series",
        slug: "test-series",
        ...overrides,
      },
    });
  },
};
