import { setupTestDb, createTestData } from "@/lib/test-utils/setup";
import { prisma } from "@/lib/test-utils/prisma";

// Set up test database
setupTestDb();

describe("Prisma Test Setup", () => {
  it("should connect to test database", async () => {
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  it("should create and clean test data", async () => {
    // Create test data
    const timeline = await createTestData.timeline();
    expect(timeline).toBeDefined();
    expect(timeline.name).toBe("Test Timeline");

    // Verify it exists
    const foundTimeline = await prisma.timeline.findUnique({
      where: { id: timeline.id },
    });
    expect(foundTimeline).toBeDefined();

    // Clean should be called automatically before next test
  });

  it("should have clean database after previous test", async () => {
    // This test should have a clean database
    const timelines = await prisma.timeline.findMany();
    expect(timelines).toHaveLength(0);
  });

  it("should create a kit with relationships", async () => {
    const timeline = await createTestData.timeline();
    const series = await createTestData.series({ timelineId: timeline.id });
    const grade = await createTestData.grade();
    const kit = await createTestData.kit({
      seriesId: series.id,
      gradeId: grade.id
    });

    expect(kit).toBeDefined();
    expect(kit.seriesId).toBe(series.id);
    expect(kit.gradeId).toBe(grade.id);

    // Test relationship
    const kitWithSeries = await prisma.kit.findUnique({
      where: { id: kit.id },
      include: { series: true, grade: true },
    });

    expect(kitWithSeries?.series).toBeDefined();
    expect(kitWithSeries?.series?.timelineId).toBe(timeline.id);
    expect(kitWithSeries?.grade).toBeDefined();
    expect(kitWithSeries?.grade?.name).toBe("HG");
  });
});
