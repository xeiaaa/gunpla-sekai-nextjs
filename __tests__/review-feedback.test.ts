import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/test-utils/prisma';

describe('Review Feedback System', () => {
  let testUser: any;
  let testKit: any;
  let testReview: any;

  beforeEach(async () => {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'test-user-feedback',
        email: 'test-feedback@example.com',
        firstName: 'Test',
        lastName: 'User',
      },
    });

    // Create test kit
    testKit = await prisma.kit.create({
      data: {
        name: 'Test Kit for Feedback',
        number: 'TEST-FB-001',
        productLineId: (await prisma.productLine.findFirst())?.id,
      },
    });

    // Create test review
    testReview = await prisma.review.create({
      data: {
        userId: testUser.id,
        kitId: testKit.id,
        title: 'Test Review for Feedback',
        content: 'This is a test review for feedback testing.',
        overallScore: 8.5,
      },
    });

    // Create category scores
    await prisma.reviewScore.createMany({
      data: [
        {
          reviewId: testReview.id,
          category: 'BUILD_QUALITY_ENGINEERING',
          score: 8,
        },
        {
          reviewId: testReview.id,
          category: 'ARTICULATION_POSEABILITY',
          score: 9,
        },
      ],
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.reviewFeedback.deleteMany({
      where: { reviewId: testReview.id },
    });
    await prisma.reviewScore.deleteMany({
      where: { reviewId: testReview.id },
    });
    await prisma.review.deleteMany({
      where: { id: testReview.id },
    });
    await prisma.kit.deleteMany({
      where: { id: testKit.id },
    });
    await prisma.user.deleteMany({
      where: { id: testUser.id },
    });
  });

  describe('ReviewFeedback Model', () => {
    it('should create feedback successfully', async () => {
      const feedback = await prisma.reviewFeedback.create({
        data: {
          reviewId: testReview.id,
          userId: testUser.id,
          isHelpful: true,
        },
      });

      expect(feedback).toBeDefined();
      expect(feedback.reviewId).toBe(testReview.id);
      expect(feedback.userId).toBe(testUser.id);
      expect(feedback.isHelpful).toBe(true);
    });

    it('should prevent duplicate feedback from same user', async () => {
      // Create first feedback
      await prisma.reviewFeedback.create({
        data: {
          reviewId: testReview.id,
          userId: testUser.id,
          isHelpful: true,
        },
      });

      // Try to create duplicate feedback
      await expect(
        prisma.reviewFeedback.create({
          data: {
            reviewId: testReview.id,
            userId: testUser.id,
            isHelpful: false,
          },
        })
      ).rejects.toThrow();
    });

    it('should allow different users to provide feedback on same review', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          id: 'test-user-feedback-2',
          email: 'test-feedback-2@example.com',
          firstName: 'Test',
          lastName: 'User2',
        },
      });

      try {
        // Create feedback from first user
        const feedback1 = await prisma.reviewFeedback.create({
          data: {
            reviewId: testReview.id,
            userId: testUser.id,
            isHelpful: true,
          },
        });

        // Create feedback from second user
        const feedback2 = await prisma.reviewFeedback.create({
          data: {
            reviewId: testReview.id,
            userId: anotherUser.id,
            isHelpful: false,
          },
        });

        expect(feedback1).toBeDefined();
        expect(feedback2).toBeDefined();
        expect(feedback1.isHelpful).toBe(true);
        expect(feedback2.isHelpful).toBe(false);
      } finally {
        // Clean up second user
        await prisma.user.deleteMany({
          where: { id: anotherUser.id },
        });
      }
    });

    it('should cascade delete feedback when review is deleted', async () => {
      // Create feedback
      await prisma.reviewFeedback.create({
        data: {
          reviewId: testReview.id,
          userId: testUser.id,
          isHelpful: true,
        },
      });

      // Delete review
      await prisma.review.delete({
        where: { id: testReview.id },
      });

      // Check that feedback was also deleted
      const feedback = await prisma.reviewFeedback.findFirst({
        where: { reviewId: testReview.id },
      });

      expect(feedback).toBeNull();
    });

    it('should cascade delete feedback when user is deleted', async () => {
      // Create feedback
      await prisma.reviewFeedback.create({
        data: {
          reviewId: testReview.id,
          userId: testUser.id,
          isHelpful: true,
        },
      });

      // Delete user
      await prisma.user.delete({
        where: { id: testUser.id },
      });

      // Check that feedback was also deleted
      const feedback = await prisma.reviewFeedback.findFirst({
        where: { userId: testUser.id },
      });

      expect(feedback).toBeNull();
    });
  });

  describe('Feedback Aggregation', () => {
    it('should count helpful and not helpful feedback correctly', async () => {
      // Create multiple users and feedback
      const users = await Promise.all([
        prisma.user.create({
          data: {
            id: 'test-user-fb-1',
            email: 'test-fb-1@example.com',
            firstName: 'Test',
            lastName: 'User1',
          },
        }),
        prisma.user.create({
          data: {
            id: 'test-user-fb-2',
            email: 'test-fb-2@example.com',
            firstName: 'Test',
            lastName: 'User2',
          },
        }),
        prisma.user.create({
          data: {
            id: 'test-user-fb-3',
            email: 'test-fb-3@example.com',
            firstName: 'Test',
            lastName: 'User3',
          },
        }),
      ]);

      try {
        // Create feedback: 2 helpful, 1 not helpful
        await prisma.reviewFeedback.createMany({
          data: [
            {
              reviewId: testReview.id,
              userId: users[0].id,
              isHelpful: true,
            },
            {
              reviewId: testReview.id,
              userId: users[1].id,
              isHelpful: true,
            },
            {
              reviewId: testReview.id,
              userId: users[2].id,
              isHelpful: false,
            },
          ],
        });

        // Get aggregated counts
        const feedbackCounts = await prisma.reviewFeedback.groupBy({
          by: ['isHelpful'],
          where: { reviewId: testReview.id },
          _count: {
            isHelpful: true,
          },
        });

        const helpfulCount = feedbackCounts.find(f => f.isHelpful)?._count.isHelpful || 0;
        const notHelpfulCount = feedbackCounts.find(f => !f.isHelpful)?._count.isHelpful || 0;

        expect(helpfulCount).toBe(2);
        expect(notHelpfulCount).toBe(1);
      } finally {
        // Clean up test users
        await prisma.user.deleteMany({
          where: { id: { in: users.map(u => u.id) } },
        });
      }
    });
  });
});
