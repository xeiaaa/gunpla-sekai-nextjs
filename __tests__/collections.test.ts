import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { prisma } from '@/lib/test-utils/prisma';
import {
  addToCollection,
  removeFromCollection,
  updateCollectionStatus,
  getUserCollection,
  getKitCollectionStatus
} from '@/lib/actions/collections';
import { CollectionStatus } from '@/generated/prisma';

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock Next.js revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockAuth = require('@clerk/nextjs/server').auth;

describe('Collection Actions', () => {
  let testUser: any;
  let testKit: any;

  beforeEach(async () => {
    // Create test user with unique email
    const timestamp = Date.now();
    testUser = await prisma.user.create({
      data: {
        id: `test-user-${timestamp}`,
        email: `test-${timestamp}@example.com`,
        username: `testuser-${timestamp}`,
      },
    });

    // Create test kit
    testKit = await prisma.kit.create({
      data: {
        name: `Test Kit ${timestamp}`,
        slug: `test-kit-${timestamp}`,
        number: `TEST-${timestamp}`,
        productLine: {
          connectOrCreate: {
            where: { name: 'Test Line' },
            create: {
              name: 'Test Line',
              slug: 'test-line',
              grade: {
                connectOrCreate: {
                  where: { name: 'HG' },
                  create: { name: 'HG', slug: 'hg' },
                },
              },
            },
          },
        },
        releaseType: {
          connectOrCreate: {
            where: { name: 'Regular' },
            create: { name: 'Regular', slug: 'regular' },
          },
        },
      },
    });

    // Mock authenticated user
    mockAuth.mockResolvedValue({ userId: testUser.id });
  });

  afterEach(async () => {
    // Clean up test data
    if (testUser?.id) {
      await prisma.userKitCollection.deleteMany({
        where: { userId: testUser.id },
      });
      await prisma.user.deleteMany({
        where: { id: testUser.id },
      });
    }
    if (testKit?.id) {
      await prisma.kit.deleteMany({
        where: { id: testKit.id },
      });
    }
  });

  describe('addToCollection', () => {
    it('should add a kit to user collection', async () => {
      const result = await addToCollection(testKit.id, CollectionStatus.WISHLIST);

      expect(result.success).toBe(true);
      expect(result.collection).toBeDefined();
      expect(result.collection.status).toBe(CollectionStatus.WISHLIST);

      // Verify in database
      const collection = await prisma.userKitCollection.findUnique({
        where: {
          userId_kitId: {
            userId: testUser.id,
            kitId: testKit.id,
          },
        },
      });

      expect(collection).toBeDefined();
      expect(collection?.status).toBe(CollectionStatus.WISHLIST);
    });

    it('should throw error for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await expect(
        addToCollection(testKit.id, CollectionStatus.WISHLIST)
      ).rejects.toThrow('User must be authenticated to add to collection');
    });

    it('should throw error for non-existent kit', async () => {
      await expect(
        addToCollection('non-existent-kit', CollectionStatus.WISHLIST)
      ).rejects.toThrow('Kit not found');
    });
  });

  describe('removeFromCollection', () => {
    it('should remove a kit from user collection', async () => {
      // First add to collection
      await addToCollection(testKit.id, CollectionStatus.WISHLIST);

      // Then remove
      const result = await removeFromCollection(testKit.id);

      expect(result.success).toBe(true);

      // Verify removed from database
      const collection = await prisma.userKitCollection.findUnique({
        where: {
          userId_kitId: {
            userId: testUser.id,
            kitId: testKit.id,
          },
        },
      });

      expect(collection).toBeNull();
    });

    it('should throw error for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await expect(
        removeFromCollection(testKit.id)
      ).rejects.toThrow('User must be authenticated to remove from collection');
    });
  });

  describe('updateCollectionStatus', () => {
    it('should update collection status', async () => {
      // First add to wishlist
      await addToCollection(testKit.id, CollectionStatus.WISHLIST);

      // Then update to backlog
      const result = await updateCollectionStatus(testKit.id, CollectionStatus.BACKLOG);

      expect(result.success).toBe(true);
      expect(result.collection.status).toBe(CollectionStatus.BACKLOG);

      // Verify in database
      const collection = await prisma.userKitCollection.findUnique({
        where: {
          userId_kitId: {
            userId: testUser.id,
            kitId: testKit.id,
          },
        },
      });

      expect(collection?.status).toBe(CollectionStatus.BACKLOG);
    });

    it('should throw error for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      await expect(
        updateCollectionStatus(testKit.id, CollectionStatus.BACKLOG)
      ).rejects.toThrow('User must be authenticated to update collection');
    });
  });

  describe('getUserCollection', () => {
    it('should return user collection for specific status', async () => {
      // Add kits to different statuses
      await addToCollection(testKit.id, CollectionStatus.WISHLIST);

      const wishlist = await getUserCollection(CollectionStatus.WISHLIST);

      expect(wishlist).toHaveLength(1);
      expect(wishlist[0].status).toBe(CollectionStatus.WISHLIST);
      expect(wishlist[0].kit.id).toBe(testKit.id);
    });

    it('should return all user collections when no status specified', async () => {
      // Add kits to different statuses
      await addToCollection(testKit.id, CollectionStatus.WISHLIST);

      const allCollections = await getUserCollection();

      expect(allCollections).toHaveLength(1);
      expect(allCollections[0].status).toBe(CollectionStatus.WISHLIST);
    });

    it('should return empty array for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const collections = await getUserCollection();

      expect(collections).toEqual([]);
    });
  });

  describe('getKitCollectionStatus', () => {
    it('should return collection status for kit', async () => {
      await addToCollection(testKit.id, CollectionStatus.BACKLOG);

      const status = await getKitCollectionStatus(testKit.id);

      expect(status).toBe(CollectionStatus.BACKLOG);
    });

    it('should return null if kit not in collection', async () => {
      const status = await getKitCollectionStatus(testKit.id);

      expect(status).toBeNull();
    });

    it('should return null for unauthenticated user', async () => {
      mockAuth.mockResolvedValue({ userId: null });

      const status = await getKitCollectionStatus(testKit.id);

      expect(status).toBeNull();
    });
  });
});
