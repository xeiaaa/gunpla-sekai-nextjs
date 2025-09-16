import { setupTestDb, createTestData } from "@/lib/test-utils/setup";
import { prisma } from "@/lib/test-utils/prisma";

// Set up test database
setupTestDb();

describe("Prisma Model Unit Tests", () => {
  describe("Timeline Model", () => {
    it("should create a timeline with required fields", async () => {
      const timeline = await prisma.timeline.create({
        data: {
          name: "Universal Century",
          slug: "universal-century",
          description: "The main Gundam timeline"
        }
      });

      expect(timeline.id).toBeDefined();
      expect(timeline.name).toBe("Universal Century");
      expect(timeline.slug).toBe("universal-century");
      expect(timeline.description).toBe("The main Gundam timeline");
      expect(timeline.createdAt).toBeInstanceOf(Date);
      expect(timeline.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      await prisma.timeline.create({
        data: { name: "Test Timeline" }
      });

      await expect(
        prisma.timeline.create({
          data: { name: "Test Timeline" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      await prisma.timeline.create({
        data: { name: "Timeline 1", slug: "test-slug" }
      });

      await expect(
        prisma.timeline.create({
          data: { name: "Timeline 2", slug: "test-slug" }
        })
      ).rejects.toThrow();
    });

    it("should allow null slug", async () => {
      const timeline = await prisma.timeline.create({
        data: { name: "Timeline Without Slug" }
      });

      expect(timeline.slug).toBeNull();
    });

    it("should update timeline", async () => {
      const timeline = await prisma.timeline.create({
        data: { name: "Original Name" }
      });

      const updated = await prisma.timeline.update({
        where: { id: timeline.id },
        data: { name: "Updated Name" }
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.updatedAt.getTime()).toBeGreaterThan(timeline.updatedAt.getTime());
    });

    it("should delete timeline", async () => {
      const timeline = await prisma.timeline.create({
        data: { name: "To Delete" }
      });

      await prisma.timeline.delete({
        where: { id: timeline.id }
      });

      const deleted = await prisma.timeline.findUnique({
        where: { id: timeline.id }
      });

      expect(deleted).toBeNull();
    });
  });

  describe("Series Model", () => {
    it("should create a series with required fields", async () => {
      const series = await prisma.series.create({
        data: {
          name: "Mobile Suit Gundam",
          slug: "mobile-suit-gundam",
          description: "The original Gundam series"
        }
      });

      expect(series.id).toBeDefined();
      expect(series.name).toBe("Mobile Suit Gundam");
      expect(series.slug).toBe("mobile-suit-gundam");
      expect(series.description).toBe("The original Gundam series");
      expect(series.scrapedImages).toEqual([]);
      expect(series.timelineId).toBeNull();
      expect(series.createdAt).toBeInstanceOf(Date);
      expect(series.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      await prisma.series.create({
        data: { name: "Test Series" }
      });

      await expect(
        prisma.series.create({
          data: { name: "Test Series" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      await prisma.series.create({
        data: { name: "Series 1", slug: "test-slug" }
      });

      await expect(
        prisma.series.create({
          data: { name: "Series 2", slug: "test-slug" }
        })
      ).rejects.toThrow();
    });

    it("should create series with timeline relationship", async () => {
      const timeline = await createTestData.timeline();

      const series = await prisma.series.create({
        data: {
          name: "Series with Timeline",
          timelineId: timeline.id
        }
      });

      expect(series.timelineId).toBe(timeline.id);
    });

    it("should handle timeline deletion with SetNull", async () => {
      const timeline = await createTestData.timeline();
      const series = await prisma.series.create({
        data: {
          name: "Series with Timeline",
          timelineId: timeline.id
        }
      });

      await prisma.timeline.delete({
        where: { id: timeline.id }
      });

      const updatedSeries = await prisma.series.findUnique({
        where: { id: series.id }
      });

      expect(updatedSeries?.timelineId).toBeNull();
    });
  });

  describe("Grade Model", () => {
    it("should create a grade with required fields", async () => {
      const grade = await prisma.grade.create({
        data: {
          name: "High Grade",
          slug: "hg",
          description: "1/144 scale kits"
        }
      });

      expect(grade.id).toBeDefined();
      expect(grade.name).toBe("High Grade");
      expect(grade.slug).toBe("hg");
      expect(grade.description).toBe("1/144 scale kits");
      expect(grade.createdAt).toBeInstanceOf(Date);
      expect(grade.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      await prisma.grade.create({
        data: { name: "Test Grade" }
      });

      await expect(
        prisma.grade.create({
          data: { name: "Test Grade" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      await prisma.grade.create({
        data: { name: "Grade 1", slug: "test-slug" }
      });

      await expect(
        prisma.grade.create({
          data: { name: "Grade 2", slug: "test-slug" }
        })
      ).rejects.toThrow();
    });
  });

  describe("ProductLine Model", () => {
    it("should create a product line with required fields", async () => {
      const grade = await createTestData.grade();

      const productLine = await prisma.productLine.create({
        data: {
          name: "HGUC",
          slug: "hguc",
          description: "High Grade Universal Century",
          gradeId: grade.id
        }
      });

      expect(productLine.id).toBeDefined();
      expect(productLine.name).toBe("HGUC");
      expect(productLine.slug).toBe("hguc");
      expect(productLine.description).toBe("High Grade Universal Century");
      expect(productLine.gradeId).toBe(grade.id);
      expect(productLine.logoId).toBeNull();
      expect(productLine.scrapedImage).toBeNull();
      expect(productLine.createdAt).toBeInstanceOf(Date);
      expect(productLine.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      const grade = await createTestData.grade();

      await prisma.productLine.create({
        data: { name: "Test Product Line", gradeId: grade.id }
      });

      await expect(
        prisma.productLine.create({
          data: { name: "Test Product Line", gradeId: grade.id }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      const grade = await createTestData.grade();

      await prisma.productLine.create({
        data: { name: "Product Line 1", slug: "test-slug", gradeId: grade.id }
      });

      await expect(
        prisma.productLine.create({
          data: { name: "Product Line 2", slug: "test-slug", gradeId: grade.id }
        })
      ).rejects.toThrow();
    });

    it("should cascade delete when grade is deleted", async () => {
      const grade = await createTestData.grade();
      const productLine = await prisma.productLine.create({
        data: { name: "Test Product Line", gradeId: grade.id }
      });

      await prisma.grade.delete({
        where: { id: grade.id }
      });

      const deletedProductLine = await prisma.productLine.findUnique({
        where: { id: productLine.id }
      });

      expect(deletedProductLine).toBeNull();
    });
  });

  describe("ReleaseType Model", () => {
    it("should create a release type with required fields", async () => {
      const releaseType = await prisma.releaseType.create({
        data: {
          name: "Retail",
          slug: "retail"
        }
      });

      expect(releaseType.id).toBeDefined();
      expect(releaseType.name).toBe("Retail");
      expect(releaseType.slug).toBe("retail");
      expect(releaseType.createdAt).toBeInstanceOf(Date);
      expect(releaseType.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      await prisma.releaseType.create({
        data: { name: "Test Release Type", slug: "test-release-type" }
      });

      await expect(
        prisma.releaseType.create({
          data: { name: "Test Release Type", slug: "test-release-type-2" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      await prisma.releaseType.create({
        data: { name: "Release Type 1", slug: "test-slug" }
      });

      await expect(
        prisma.releaseType.create({
          data: { name: "Release Type 2", slug: "test-slug" }
        })
      ).rejects.toThrow();
    });
  });

  describe("Kit Model", () => {
    it("should create a kit with required fields", async () => {
      const grade = await createTestData.grade();

      const kit = await prisma.kit.create({
        data: {
          name: "RX-78-2 Gundam",
          number: "HG-001",
          gradeId: grade.id
        }
      });

      expect(kit.id).toBeDefined();
      expect(kit.name).toBe("RX-78-2 Gundam");
      expect(kit.number).toBe("HG-001");
      expect(kit.gradeId).toBe(grade.id);
      expect(kit.slug).toBeNull();
      expect(kit.variant).toBeNull();
      expect(kit.releaseDate).toBeNull();
      expect(kit.priceYen).toBeNull();
      expect(kit.region).toBeNull();
      expect(kit.boxArt).toBeNull();
      expect(kit.notes).toBeNull();
      expect(kit.manualLinks).toEqual([]);
      expect(kit.scrapedImages).toEqual([]);
      expect(kit.potentialBaseKit).toBeNull();
      expect(kit.productLineId).toBeNull();
      expect(kit.seriesId).toBeNull();
      expect(kit.releaseTypeId).toBeNull();
      expect(kit.baseKitId).toBeNull();
      expect(kit.createdAt).toBeInstanceOf(Date);
      expect(kit.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a kit with all optional fields", async () => {
      const grade = await createTestData.grade();
      const series = await createTestData.series();
      const releaseType = await prisma.releaseType.create({
        data: { name: "Retail", slug: "retail" }
      });

      const kit = await prisma.kit.create({
        data: {
          name: "RX-78-2 Gundam",
          slug: "rx-78-2-gundam",
          number: "HG-001",
          variant: "Ver. G30th",
          releaseDate: new Date("2020-01-01"),
          priceYen: 1500,
          region: "Japan",
          boxArt: "https://example.com/boxart.jpg",
          notes: "Test notes",
          manualLinks: ["https://example.com/manual.pdf"],
          scrapedImages: ["https://example.com/image1.jpg"],
          potentialBaseKit: "HG-001",
          gradeId: grade.id,
          seriesId: series.id,
          releaseTypeId: releaseType.id
        }
      });

      expect(kit.slug).toBe("rx-78-2-gundam");
      expect(kit.variant).toBe("Ver. G30th");
      expect(kit.releaseDate).toEqual(new Date("2020-01-01"));
      expect(kit.priceYen).toBe(1500);
      expect(kit.region).toBe("Japan");
      expect(kit.boxArt).toBe("https://example.com/boxart.jpg");
      expect(kit.notes).toBe("Test notes");
      expect(kit.manualLinks).toEqual(["https://example.com/manual.pdf"]);
      expect(kit.scrapedImages).toEqual(["https://example.com/image1.jpg"]);
      expect(kit.potentialBaseKit).toBe("HG-001");
      expect(kit.seriesId).toBe(series.id);
      expect(kit.releaseTypeId).toBe(releaseType.id);
    });

    it("should enforce unique constraint on slug", async () => {
      const grade = await createTestData.grade();

      await prisma.kit.create({
        data: { name: "Kit 1", slug: "test-slug", number: "001", gradeId: grade.id }
      });

      await expect(
        prisma.kit.create({
          data: { name: "Kit 2", slug: "test-slug", number: "002", gradeId: grade.id }
        })
      ).rejects.toThrow();
    });

    it("should cascade delete when grade is deleted", async () => {
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      await prisma.grade.delete({
        where: { id: grade.id }
      });

      const deletedKit = await prisma.kit.findUnique({
        where: { id: kit.id }
      });

      expect(deletedKit).toBeNull();
    });

    it("should handle base kit relationship", async () => {
      const grade = await createTestData.grade();

      const baseKit = await prisma.kit.create({
        data: { name: "Base Kit", number: "001", gradeId: grade.id }
      });

      const variantKit = await prisma.kit.create({
        data: {
          name: "Variant Kit",
          number: "002",
          gradeId: grade.id,
          baseKitId: baseKit.id
        }
      });

      expect(variantKit.baseKitId).toBe(baseKit.id);

      // Test SetNull behavior
      await prisma.kit.delete({
        where: { id: baseKit.id }
      });

      const updatedVariant = await prisma.kit.findUnique({
        where: { id: variantKit.id }
      });

      expect(updatedVariant?.baseKitId).toBeNull();
    });
  });

  describe("MobileSuit Model", () => {
    it("should create a mobile suit with required fields", async () => {
      const mobileSuit = await prisma.mobileSuit.create({
        data: {
          name: "RX-78-2 Gundam",
          slug: "rx-78-2-gundam",
          description: "The original Gundam"
        }
      });

      expect(mobileSuit.id).toBeDefined();
      expect(mobileSuit.name).toBe("RX-78-2 Gundam");
      expect(mobileSuit.slug).toBe("rx-78-2-gundam");
      expect(mobileSuit.description).toBe("The original Gundam");
      expect(mobileSuit.seriesId).toBeNull();
      expect(mobileSuit.scrapedImages).toEqual([]);
      expect(mobileSuit.createdAt).toBeInstanceOf(Date);
      expect(mobileSuit.updatedAt).toBeInstanceOf(Date);
    });

    it("should enforce unique constraint on name", async () => {
      await prisma.mobileSuit.create({
        data: { name: "Test Mobile Suit" }
      });

      await expect(
        prisma.mobileSuit.create({
          data: { name: "Test Mobile Suit" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on slug", async () => {
      await prisma.mobileSuit.create({
        data: { name: "Mobile Suit 1", slug: "test-slug" }
      });

      await expect(
        prisma.mobileSuit.create({
          data: { name: "Mobile Suit 2", slug: "test-slug" }
        })
      ).rejects.toThrow();
    });

    it("should create mobile suit with series relationship", async () => {
      const series = await createTestData.series();

      const mobileSuit = await prisma.mobileSuit.create({
        data: {
          name: "Mobile Suit with Series",
          seriesId: series.id
        }
      });

      expect(mobileSuit.seriesId).toBe(series.id);
    });

    it("should handle series deletion with SetNull", async () => {
      const series = await createTestData.series();
      const mobileSuit = await prisma.mobileSuit.create({
        data: {
          name: "Mobile Suit with Series",
          seriesId: series.id
        }
      });

      await prisma.series.delete({
        where: { id: series.id }
      });

      const updatedMobileSuit = await prisma.mobileSuit.findUnique({
        where: { id: mobileSuit.id }
      });

      expect(updatedMobileSuit?.seriesId).toBeNull();
    });
  });

  describe("Junction Tables", () => {
    describe("KitMobileSuit", () => {
      it("should create kit-mobile suit relationship", async () => {
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const mobileSuit = await prisma.mobileSuit.create({
          data: { name: "Test Mobile Suit" }
        });

        const kitMobileSuit = await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        expect(kitMobileSuit.id).toBeDefined();
        expect(kitMobileSuit.kitId).toBe(kit.id);
        expect(kitMobileSuit.mobileSuitId).toBe(mobileSuit.id);
        expect(kitMobileSuit.createdAt).toBeInstanceOf(Date);
        expect(kitMobileSuit.updatedAt).toBeInstanceOf(Date);
      });

      it("should enforce unique constraint on kit-mobile suit pair", async () => {
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const mobileSuit = await prisma.mobileSuit.create({
          data: { name: "Test Mobile Suit" }
        });

        await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        await expect(
          prisma.kitMobileSuit.create({
            data: {
              kitId: kit.id,
              mobileSuitId: mobileSuit.id
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when kit is deleted", async () => {
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const mobileSuit = await prisma.mobileSuit.create({
          data: { name: "Test Mobile Suit" }
        });

        const kitMobileSuit = await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        await prisma.kit.delete({
          where: { id: kit.id }
        });

        const deletedRelation = await prisma.kitMobileSuit.findUnique({
          where: { id: kitMobileSuit.id }
        });

        expect(deletedRelation).toBeNull();
      });

      it("should cascade delete when mobile suit is deleted", async () => {
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const mobileSuit = await prisma.mobileSuit.create({
          data: { name: "Test Mobile Suit" }
        });

        const kitMobileSuit = await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        await prisma.mobileSuit.delete({
          where: { id: mobileSuit.id }
        });

        const deletedRelation = await prisma.kitMobileSuit.findUnique({
          where: { id: kitMobileSuit.id }
        });

        expect(deletedRelation).toBeNull();
      });
    });
  });

  describe("User Model", () => {
    it("should create a user with required fields", async () => {
      const user = await prisma.user.create({
        data: {
          id: "test-user-1",
          email: "test@example.com"
        }
      });

      expect(user.id).toBe("test-user-1");
      expect(user.email).toBe("test@example.com");
      expect(user.username).toBeNull();
      expect(user.firstName).toBeNull();
      expect(user.lastName).toBeNull();
      expect(user.imageUrl).toBeNull();
      expect(user.avatarUrl).toBeNull();
      expect(user.isAdmin).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a user with all optional fields", async () => {
      const user = await prisma.user.create({
        data: {
          id: "test-user-2",
          email: "test2@example.com",
          username: "testuser",
          firstName: "Test",
          lastName: "User",
          imageUrl: "https://example.com/image.jpg",
          avatarUrl: "https://example.com/avatar.jpg",
          isAdmin: true
        }
      });

      expect(user.username).toBe("testuser");
      expect(user.firstName).toBe("Test");
      expect(user.lastName).toBe("User");
      expect(user.imageUrl).toBe("https://example.com/image.jpg");
      expect(user.avatarUrl).toBe("https://example.com/avatar.jpg");
      expect(user.isAdmin).toBe(true);
    });

    it("should enforce unique constraint on email", async () => {
      await prisma.user.create({
        data: { id: "user-1", email: "test@example.com" }
      });

      await expect(
        prisma.user.create({
          data: { id: "user-2", email: "test@example.com" }
        })
      ).rejects.toThrow();
    });

    it("should enforce unique constraint on username", async () => {
      await prisma.user.create({
        data: { id: "user-1", email: "test1@example.com", username: "testuser" }
      });

      await expect(
        prisma.user.create({
          data: { id: "user-2", email: "test2@example.com", username: "testuser" }
        })
      ).rejects.toThrow();
    });

    it("should allow null username", async () => {
      const user = await prisma.user.create({
        data: { id: "user-1", email: "test@example.com" }
      });

      expect(user.username).toBeNull();
    });
  });

  describe("UserKitCollection Model", () => {
    it("should create a user kit collection with required fields", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      const collection = await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "WISHLIST"
        }
      });

      expect(collection.id).toBeDefined();
      expect(collection.userId).toBe(user.id);
      expect(collection.kitId).toBe(kit.id);
      expect(collection.status).toBe("WISHLIST");
      expect(collection.notes).toBeNull();
      expect(collection.addedAt).toBeInstanceOf(Date);
      expect(collection.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a user kit collection with notes", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      const collection = await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "BACKLOG",
          notes: "Planning to build this next"
        }
      });

      expect(collection.status).toBe("BACKLOG");
      expect(collection.notes).toBe("Planning to build this next");
    });

    it("should enforce unique constraint on user-kit pair", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "WISHLIST"
        }
      });

      await expect(
        prisma.userKitCollection.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            status: "BACKLOG"
          }
        })
      ).rejects.toThrow();
    });

    it("should validate CollectionStatus enum", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      // Valid enum values
      const validStatuses = ["WISHLIST", "BACKLOG", "BUILT"];

      for (const status of validStatuses) {
        const collection = await prisma.userKitCollection.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            status: status as "WISHLIST" | "BACKLOG" | "BUILT"
          }
        });
        expect(collection.status).toBe(status);
        await prisma.userKitCollection.delete({ where: { id: collection.id } });
      }

      // Invalid enum value should throw
      await expect(
        prisma.userKitCollection.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            status: "INVALID_STATUS" as never
          }
        })
      ).rejects.toThrow();
    });

    it("should cascade delete when user is deleted", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      const collection = await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "WISHLIST"
        }
      });

      await prisma.user.delete({
        where: { id: user.id }
      });

      const deletedCollection = await prisma.userKitCollection.findUnique({
        where: { id: collection.id }
      });

      expect(deletedCollection).toBeNull();
    });

    it("should cascade delete when kit is deleted", async () => {
      const user = await prisma.user.create({
        data: { id: "test-user", email: "test@example.com" }
      });
      const grade = await createTestData.grade();
      const kit = await prisma.kit.create({
        data: { name: "Test Kit", number: "001", gradeId: grade.id }
      });

      const collection = await prisma.userKitCollection.create({
        data: {
          userId: user.id,
          kitId: kit.id,
          status: "WISHLIST"
        }
      });

      await prisma.kit.delete({
        where: { id: kit.id }
      });

      const deletedCollection = await prisma.userKitCollection.findUnique({
        where: { id: collection.id }
      });

      expect(deletedCollection).toBeNull();
    });
  });

  describe("Review Models", () => {
    describe("Review Model", () => {
      it("should create a review with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Great kit!",
            content: "Really enjoyed building this kit.",
            overallScore: 8.5
          }
        });

        expect(review.id).toBeDefined();
        expect(review.userId).toBe(user.id);
        expect(review.kitId).toBe(kit.id);
        expect(review.title).toBe("Great kit!");
        expect(review.content).toBe("Really enjoyed building this kit.");
        expect(review.overallScore).toBe(8.5);
        expect(review.createdAt).toBeInstanceOf(Date);
        expect(review.updatedAt).toBeInstanceOf(Date);
      });

      it("should create a review with minimal fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 7.0
          }
        });

        expect(review.title).toBeNull();
        expect(review.content).toBeNull();
        expect(review.overallScore).toBe(7.0);
      });

      it("should enforce unique constraint on user-kit pair", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        await expect(
          prisma.review.create({
            data: {
              userId: user.id,
              kitId: kit.id,
              overallScore: 9.0
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when user is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedReview = await prisma.review.findUnique({
          where: { id: review.id }
        });

        expect(deletedReview).toBeNull();
      });

      it("should cascade delete when kit is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        await prisma.kit.delete({
          where: { id: kit.id }
        });

        const deletedReview = await prisma.review.findUnique({
          where: { id: review.id }
        });

        expect(deletedReview).toBeNull();
      });
    });

    describe("ReviewScore Model", () => {
      it("should create a review score with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        const reviewScore = await prisma.reviewScore.create({
          data: {
            reviewId: review.id,
            category: "BUILD_QUALITY_ENGINEERING",
            score: 8,
            notes: "Great engineering"
          }
        });

        expect(reviewScore.id).toBeDefined();
        expect(reviewScore.reviewId).toBe(review.id);
        expect(reviewScore.category).toBe("BUILD_QUALITY_ENGINEERING");
        expect(reviewScore.score).toBe(8);
        expect(reviewScore.notes).toBe("Great engineering");
      });

      it("should create a review score without notes", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        const reviewScore = await prisma.reviewScore.create({
          data: {
            reviewId: review.id,
            category: "ARTICULATION_POSEABILITY",
            score: 7
          }
        });

        expect(reviewScore.notes).toBeNull();
      });

      it("should enforce unique constraint on review-category pair", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        await prisma.reviewScore.create({
          data: {
            reviewId: review.id,
            category: "BUILD_QUALITY_ENGINEERING",
            score: 8
          }
        });

        await expect(
          prisma.reviewScore.create({
            data: {
              reviewId: review.id,
              category: "BUILD_QUALITY_ENGINEERING",
              score: 9
            }
          })
        ).rejects.toThrow();
      });

      it("should validate ReviewCategory enum", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        const validCategories = [
          "BUILD_QUALITY_ENGINEERING",
          "ARTICULATION_POSEABILITY",
          "DETAIL_ACCURACY",
          "AESTHETICS_PROPORTIONS",
          "ACCESSORIES_GIMMICKS",
          "VALUE_EXPERIENCE"
        ];

        for (const category of validCategories) {
          const reviewScore = await prisma.reviewScore.create({
            data: {
              reviewId: review.id,
              category: category as "BUILD_QUALITY_ENGINEERING" | "ARTICULATION_POSEABILITY" | "DETAIL_ACCURACY" | "AESTHETICS_PROPORTIONS" | "ACCESSORIES_GIMMICKS" | "VALUE_EXPERIENCE",
              score: 8
            }
          });
          expect(reviewScore.category).toBe(category);
          await prisma.reviewScore.delete({ where: { id: reviewScore.id } });
        }

        await expect(
          prisma.reviewScore.create({
            data: {
              reviewId: review.id,
              category: "INVALID_CATEGORY" as never,
              score: 8
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when review is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        const reviewScore = await prisma.reviewScore.create({
          data: {
            reviewId: review.id,
            category: "BUILD_QUALITY_ENGINEERING",
            score: 8
          }
        });

        await prisma.review.delete({
          where: { id: review.id }
        });

        const deletedScore = await prisma.reviewScore.findUnique({
          where: { id: reviewScore.id }
        });

        expect(deletedScore).toBeNull();
      });
    });
  });

  describe("Build Models", () => {
    describe("Build Model", () => {
      it("should create a build with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "My First Build",
            description: "Building this kit for the first time",
            status: "PLANNING"
          }
        });

        expect(build.id).toBeDefined();
        expect(build.userId).toBe(user.id);
        expect(build.kitId).toBe(kit.id);
        expect(build.title).toBe("My First Build");
        expect(build.description).toBe("Building this kit for the first time");
        expect(build.status).toBe("PLANNING");
        expect(build.startedAt).toBeNull();
        expect(build.completedAt).toBeNull();
        expect(build.createdAt).toBeInstanceOf(Date);
        expect(build.updatedAt).toBeInstanceOf(Date);
      });

      it("should create a build with default status", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Build Without Status"
          }
        });

        expect(build.status).toBe("PLANNING");
      });

      it("should validate BuildStatus enum", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const validStatuses = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"];

        for (const status of validStatuses) {
          const build = await prisma.build.create({
            data: {
              userId: user.id,
              kitId: kit.id,
              title: `Build ${status}`,
              status: status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD"
            }
          });
          expect(build.status).toBe(status);
          await prisma.build.delete({ where: { id: build.id } });
        }

        await expect(
          prisma.build.create({
            data: {
              userId: user.id,
              kitId: kit.id,
              title: "Invalid Status Build",
              status: "INVALID_STATUS" as never
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when user is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedBuild = await prisma.build.findUnique({
          where: { id: build.id }
        });

        expect(deletedBuild).toBeNull();
      });

      it("should cascade delete when kit is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        await prisma.kit.delete({
          where: { id: kit.id }
        });

        const deletedBuild = await prisma.build.findUnique({
          where: { id: build.id }
        });

        expect(deletedBuild).toBeNull();
      });
    });

    describe("BuildMilestone Model", () => {
      it("should create a build milestone with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const milestone = await prisma.buildMilestone.create({
          data: {
            buildId: build.id,
            type: "BUILD",
            title: "Completed Head",
            description: "Finished building the head section",
            order: 1
          }
        });

        expect(milestone.id).toBeDefined();
        expect(milestone.buildId).toBe(build.id);
        expect(milestone.type).toBe("BUILD");
        expect(milestone.title).toBe("Completed Head");
        expect(milestone.description).toBe("Finished building the head section");
        expect(milestone.imageUrls).toEqual([]);
        expect(milestone.completedAt).toBeNull();
        expect(milestone.order).toBe(1);
        expect(milestone.createdAt).toBeInstanceOf(Date);
        expect(milestone.updatedAt).toBeInstanceOf(Date);
      });

      it("should validate MilestoneType enum", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const validTypes = [
          "ACQUISITION", "PLANNING", "BUILD", "PAINTING",
          "PANEL_LINING", "DECALS", "TOPCOAT", "PHOTOGRAPHY", "COMPLETION"
        ];

        for (const type of validTypes) {
          const milestone = await prisma.buildMilestone.create({
            data: {
              buildId: build.id,
              type: type as "ACQUISITION" | "PLANNING" | "BUILD" | "PAINTING" | "PANEL_LINING" | "DECALS" | "TOPCOAT" | "PHOTOGRAPHY" | "COMPLETION",
              title: `Milestone ${type}`,
              order: 1
            }
          });
          expect(milestone.type).toBe(type);
          await prisma.buildMilestone.delete({ where: { id: milestone.id } });
        }

        await expect(
          prisma.buildMilestone.create({
            data: {
              buildId: build.id,
              type: "INVALID_TYPE" as never,
              title: "Invalid Milestone",
              order: 1
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when build is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const milestone = await prisma.buildMilestone.create({
          data: {
            buildId: build.id,
            type: "BUILD",
            title: "Test Milestone",
            order: 1
          }
        });

        await prisma.build.delete({
          where: { id: build.id }
        });

        const deletedMilestone = await prisma.buildMilestone.findUnique({
          where: { id: milestone.id }
        });

        expect(deletedMilestone).toBeNull();
      });
    });

    describe("BuildComment Model", () => {
      it("should create a build comment with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const comment = await prisma.buildComment.create({
          data: {
            buildId: build.id,
            userId: user.id,
            content: "Great progress on this build!"
          }
        });

        expect(comment.id).toBeDefined();
        expect(comment.buildId).toBe(build.id);
        expect(comment.userId).toBe(user.id);
        expect(comment.content).toBe("Great progress on this build!");
        expect(comment.createdAt).toBeInstanceOf(Date);
        expect(comment.updatedAt).toBeInstanceOf(Date);
      });

      it("should cascade delete when build is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const comment = await prisma.buildComment.create({
          data: {
            buildId: build.id,
            userId: user.id,
            content: "Test comment"
          }
        });

        await prisma.build.delete({
          where: { id: build.id }
        });

        const deletedComment = await prisma.buildComment.findUnique({
          where: { id: comment.id }
        });

        expect(deletedComment).toBeNull();
      });

      it("should cascade delete when user is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Test Build"
          }
        });

        const comment = await prisma.buildComment.create({
          data: {
            buildId: build.id,
            userId: user.id,
            content: "Test comment"
          }
        });

        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedComment = await prisma.buildComment.findUnique({
          where: { id: comment.id }
        });

        expect(deletedComment).toBeNull();
      });
    });
  });

  describe("Upload and Marketplace Models", () => {
    describe("Upload Model", () => {
      it("should create an upload with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-123",
            publicId: "test-public-id",
            url: "https://example.com/image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "test-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        expect(upload.id).toBeDefined();
        expect(upload.cloudinaryAssetId).toBe("test-asset-123");
        expect(upload.publicId).toBe("test-public-id");
        expect(upload.url).toBe("https://example.com/image.jpg");
        expect(upload.eagerUrl).toBeNull();
        expect(upload.format).toBe("jpg");
        expect(upload.resourceType).toBe("image");
        expect(upload.size).toBe(1024000);
        expect(upload.pages).toBeNull();
        expect(upload.originalFilename).toBe("test-image.jpg");
        expect(upload.uploadedAt).toBeInstanceOf(Date);
        expect(upload.uploadedById).toBe(user.id);
        expect(upload.createdAt).toBeInstanceOf(Date);
        expect(upload.updatedAt).toBeInstanceOf(Date);
      });

      it("should create an upload with all optional fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-456",
            publicId: "test-public-id-2",
            url: "https://example.com/image2.jpg",
            eagerUrl: "https://example.com/eager-image2.jpg",
            format: "jpg",
            resourceType: "image",
            size: 2048000,
            pages: 5,
            originalFilename: "test-image2.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        expect(upload.eagerUrl).toBe("https://example.com/eager-image2.jpg");
        expect(upload.pages).toBe(5);
      });

      it("should enforce unique constraint on cloudinaryAssetId", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        await prisma.upload.create({
          data: {
            cloudinaryAssetId: "duplicate-asset-id",
            publicId: "public-id-1",
            url: "https://example.com/image1.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "image1.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        await expect(
          prisma.upload.create({
            data: {
              cloudinaryAssetId: "duplicate-asset-id",
              publicId: "public-id-2",
              url: "https://example.com/image2.jpg",
              format: "jpg",
              resourceType: "image",
              size: 1024000,
              originalFilename: "image2.jpg",
              uploadedAt: new Date(),
              uploadedById: user.id
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when user is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-789",
            publicId: "test-public-id-3",
            url: "https://example.com/image3.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "image3.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedUpload = await prisma.upload.findUnique({
          where: { id: upload.id }
        });

        expect(deletedUpload).toBeNull();
      });
    });

    describe("KitUpload Model", () => {
      it("should create a kit upload with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-kit",
            publicId: "test-public-kit",
            url: "https://example.com/kit-image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "kit-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        const kitUpload = await prisma.kitUpload.create({
          data: {
            kitId: kit.id,
            uploadId: upload.id,
            caption: "Box art image",
            order: 1,
            type: "BOX_ART"
          }
        });

        expect(kitUpload.id).toBeDefined();
        expect(kitUpload.kitId).toBe(kit.id);
        expect(kitUpload.uploadId).toBe(upload.id);
        expect(kitUpload.caption).toBe("Box art image");
        expect(kitUpload.order).toBe(1);
        expect(kitUpload.type).toBe("BOX_ART");
        expect(kitUpload.createdAt).toBeInstanceOf(Date);
        expect(kitUpload.updatedAt).toBeInstanceOf(Date);
      });

      it("should validate KitImageType enum", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-enum",
            publicId: "test-public-enum",
            url: "https://example.com/enum-image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "enum-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        const validTypes = ["BOX_ART", "PRODUCT_SHOTS", "RUNNERS", "MANUAL", "PROTOTYPE"];

        for (const type of validTypes) {
          const kitUpload = await prisma.kitUpload.create({
            data: {
              kitId: kit.id,
              uploadId: upload.id,
              type: type as "BOX_ART" | "PRODUCT_SHOTS" | "RUNNERS" | "MANUAL" | "PROTOTYPE",
              order: 1
            }
          });
          expect(kitUpload.type).toBe(type);
          await prisma.kitUpload.delete({ where: { id: kitUpload.id } });
        }

        await expect(
          prisma.kitUpload.create({
            data: {
              kitId: kit.id,
              uploadId: upload.id,
              type: "INVALID_TYPE" as never,
              order: 1
            }
          })
        ).rejects.toThrow();
      });

      it("should enforce unique constraint on kit-upload pair", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });
        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-unique",
            publicId: "test-public-unique",
            url: "https://example.com/unique-image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "unique-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        await prisma.kitUpload.create({
          data: {
            kitId: kit.id,
            uploadId: upload.id,
            type: "BOX_ART",
            order: 1
          }
        });

        await expect(
          prisma.kitUpload.create({
            data: {
              kitId: kit.id,
              uploadId: upload.id,
              type: "PRODUCT_SHOTS",
              order: 2
            }
          })
        ).rejects.toThrow();
      });
    });

    describe("UserStore Model", () => {
      it("should create a user store with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "My Gunpla Store",
            description: "Selling my collection",
            location: "Tokyo, Japan"
          }
        });

        expect(store.id).toBeDefined();
        expect(store.userId).toBe(user.id);
        expect(store.name).toBe("My Gunpla Store");
        expect(store.description).toBe("Selling my collection");
        expect(store.location).toBe("Tokyo, Japan");
        expect(store.createdAt).toBeInstanceOf(Date);
        expect(store.updatedAt).toBeInstanceOf(Date);
      });

      it("should create a user store with minimal fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Minimal Store"
          }
        });

        expect(store.description).toBeNull();
        expect(store.location).toBeNull();
      });

      it("should enforce unique constraint on userId", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "First Store"
          }
        });

        await expect(
          prisma.userStore.create({
            data: {
              userId: user.id,
              name: "Second Store"
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete when user is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Test Store"
          }
        });

        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedStore = await prisma.userStore.findUnique({
          where: { id: store.id }
        });

        expect(deletedStore).toBeNull();
      });
    });

    describe("MarketplaceListing Model", () => {
      it("should create a marketplace listing with required fields", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Test Store"
          }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const listing = await prisma.marketplaceListing.create({
          data: {
            storeId: store.id,
            kitId: kit.id,
            title: "RX-78-2 Gundam for Sale",
            description: "Brand new in box",
            price: 150000, // 1500 JPY in cents
            currency: "JPY",
            imageUrls: ["https://example.com/listing1.jpg"],
            available: true
          }
        });

        expect(listing.id).toBeDefined();
        expect(listing.storeId).toBe(store.id);
        expect(listing.kitId).toBe(kit.id);
        expect(listing.title).toBe("RX-78-2 Gundam for Sale");
        expect(listing.description).toBe("Brand new in box");
        expect(listing.price).toBe(150000);
        expect(listing.currency).toBe("JPY");
        expect(listing.imageUrls).toEqual(["https://example.com/listing1.jpg"]);
        expect(listing.available).toBe(true);
        expect(listing.createdAt).toBeInstanceOf(Date);
        expect(listing.updatedAt).toBeInstanceOf(Date);
      });

      it("should create a marketplace listing with default values", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Test Store"
          }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const listing = await prisma.marketplaceListing.create({
          data: {
            storeId: store.id,
            kitId: kit.id,
            title: "Default Values Test",
            price: 100000
          }
        });

        expect(listing.description).toBeNull();
        expect(listing.currency).toBe("JPY");
        expect(listing.imageUrls).toEqual([]);
        expect(listing.available).toBe(true);
      });

      it("should cascade delete when store is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Test Store"
          }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const listing = await prisma.marketplaceListing.create({
          data: {
            storeId: store.id,
            kitId: kit.id,
            title: "Test Listing",
            price: 100000
          }
        });

        await prisma.userStore.delete({
          where: { id: store.id }
        });

        const deletedListing = await prisma.marketplaceListing.findUnique({
          where: { id: listing.id }
        });

        expect(deletedListing).toBeNull();
      });

      it("should cascade delete when kit is deleted", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });
        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "Test Store"
          }
        });
        const grade = await createTestData.grade();
        const kit = await prisma.kit.create({
          data: { name: "Test Kit", number: "001", gradeId: grade.id }
        });

        const listing = await prisma.marketplaceListing.create({
          data: {
            storeId: store.id,
            kitId: kit.id,
            title: "Test Listing",
            price: 100000
          }
        });

        await prisma.kit.delete({
          where: { id: kit.id }
        });

        const deletedListing = await prisma.marketplaceListing.findUnique({
          where: { id: listing.id }
        });

        expect(deletedListing).toBeNull();
      });
    });
  });

  // Integration Tests for Relationships and Constraints
  describe("Integration Tests - Relationships and Constraints", () => {
    describe("Relation Integrity Tests", () => {
      it("should create Series with valid timelineId", async () => {
        const timeline = await prisma.timeline.create({
          data: { name: "Universal Century" }
        });

        const series = await prisma.series.create({
          data: {
            name: "Mobile Suit Gundam",
            timelineId: timeline.id
          }
        });

        expect(series.timelineId).toBe(timeline.id);
      });

      it("should fail to create Series with invalid timelineId", async () => {
        await expect(
          prisma.series.create({
            data: {
              name: "Mobile Suit Gundam",
              timelineId: "invalid-timeline-id"
            }
          })
        ).rejects.toThrow();
      });

      it("should create Kit with valid foreign keys", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const productLine = await prisma.productLine.create({
          data: {
            name: "HGUC",
            gradeId: grade.id
          }
        });

        const series = await prisma.series.create({
          data: { name: "Mobile Suit Gundam" }
        });

        const releaseType = await prisma.releaseType.create({
          data: { name: "Retail", slug: "retail" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id,
            productLineId: productLine.id,
            seriesId: series.id,
            releaseTypeId: releaseType.id
          }
        });

        expect(kit.gradeId).toBe(grade.id);
        expect(kit.productLineId).toBe(productLine.id);
        expect(kit.seriesId).toBe(series.id);
        expect(kit.releaseTypeId).toBe(releaseType.id);
      });

      it("should fail to create Kit with invalid gradeId", async () => {
        await expect(
          prisma.kit.create({
            data: {
              name: "RX-78-2 Gundam",
              number: "001",
              gradeId: "invalid-grade-id"
            }
          })
        ).rejects.toThrow();
      });
    });

    describe("Cascade/SetNull Behavior Tests", () => {
      it("should set timelineId to null when Timeline is deleted (SetNull)", async () => {
        const timeline = await prisma.timeline.create({
          data: { name: "Universal Century" }
        });

        const series = await prisma.series.create({
          data: {
            name: "Mobile Suit Gundam",
            timelineId: timeline.id
          }
        });

        // Delete the timeline
        await prisma.timeline.delete({
          where: { id: timeline.id }
        });

        // Check that series still exists but timelineId is null
        const updatedSeries = await prisma.series.findUnique({
          where: { id: series.id }
        });

        expect(updatedSeries).toBeDefined();
        expect(updatedSeries?.timelineId).toBeNull();
      });

      it("should cascade delete ProductLines when Grade is deleted", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const productLine = await prisma.productLine.create({
          data: {
            name: "HGUC",
            gradeId: grade.id
          }
        });

        // Delete the grade
        await prisma.grade.delete({
          where: { id: grade.id }
        });

        // Check that productLine is also deleted
        const deletedProductLine = await prisma.productLine.findUnique({
          where: { id: productLine.id }
        });

        expect(deletedProductLine).toBeNull();
      });

      it("should set baseKitId to null when base Kit is deleted (SetNull)", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const baseKit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const variantKit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam (Ver. GFT)",
            number: "001",
            gradeId: grade.id,
            baseKitId: baseKit.id
          }
        });

        // Delete the base kit
        await prisma.kit.delete({
          where: { id: baseKit.id }
        });

        // Check that variant kit still exists but baseKitId is null
        const updatedVariant = await prisma.kit.findUnique({
          where: { id: variantKit.id }
        });

        expect(updatedVariant).toBeDefined();
        expect(updatedVariant?.baseKitId).toBeNull();
      });
    });

    describe("Junction Table Behavior Tests", () => {
      it("should create KitMobileSuit association", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const series = await prisma.series.create({
          data: { name: "Mobile Suit Gundam" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id,
            seriesId: series.id
          }
        });

        const mobileSuit = await prisma.mobileSuit.create({
          data: {
            name: "RX-78-2 Gundam",
            seriesId: series.id
          }
        });

        const association = await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        expect(association.kitId).toBe(kit.id);
        expect(association.mobileSuitId).toBe(mobileSuit.id);
      });

      it("should fail to create duplicate KitMobileSuit association", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const series = await prisma.series.create({
          data: { name: "Mobile Suit Gundam" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id,
            seriesId: series.id
          }
        });

        const mobileSuit = await prisma.mobileSuit.create({
          data: {
            name: "RX-78-2 Gundam",
            seriesId: series.id
          }
        });

        // Create first association
        await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        // Try to create duplicate association
        await expect(
          prisma.kitMobileSuit.create({
            data: {
              kitId: kit.id,
              mobileSuitId: mobileSuit.id
            }
          })
        ).rejects.toThrow();
      });

      it("should cascade delete KitMobileSuit when Kit is deleted", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const series = await prisma.series.create({
          data: { name: "Mobile Suit Gundam" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id,
            seriesId: series.id
          }
        });

        const mobileSuit = await prisma.mobileSuit.create({
          data: {
            name: "RX-78-2 Gundam",
            seriesId: series.id
          }
        });

        const association = await prisma.kitMobileSuit.create({
          data: {
            kitId: kit.id,
            mobileSuitId: mobileSuit.id
          }
        });

        // Delete the kit
        await prisma.kit.delete({
          where: { id: kit.id }
        });

        // Check that association is also deleted
        const deletedAssociation = await prisma.kitMobileSuit.findUnique({
          where: { id: association.id }
        });

        expect(deletedAssociation).toBeNull();
      });

      it("should create KitUpload association with proper constraints", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-123",
            publicId: "test-public-id",
            url: "https://example.com/image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "test-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        const kitUpload = await prisma.kitUpload.create({
          data: {
            kitId: kit.id,
            uploadId: upload.id,
            caption: "Box art",
            order: 1,
            type: "BOX_ART"
          }
        });

        expect(kitUpload.kitId).toBe(kit.id);
        expect(kitUpload.uploadId).toBe(upload.id);
        expect(kitUpload.type).toBe("BOX_ART");
      });

      it("should fail to create duplicate KitUpload association", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-123",
            publicId: "test-public-id",
            url: "https://example.com/image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "test-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        // Create first association
        await prisma.kitUpload.create({
          data: {
            kitId: kit.id,
            uploadId: upload.id,
            type: "BOX_ART"
          }
        });

        // Try to create duplicate association
        await expect(
          prisma.kitUpload.create({
            data: {
              kitId: kit.id,
              uploadId: upload.id,
              type: "PRODUCT_SHOTS"
            }
          })
        ).rejects.toThrow();
      });
    });

    describe("Complex Relationship Chains", () => {
      it("should handle User->UserKitCollection->Kit relationship chain", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        await prisma.userKitCollection.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            status: "WISHLIST",
            notes: "Want to build this"
          }
        });

        // Verify the relationship chain
        const userWithCollection = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            collections: {
              include: {
                kit: true
              }
            }
          }
        });

        expect(userWithCollection?.collections).toHaveLength(1);
        expect(userWithCollection?.collections[0].kit.name).toBe("RX-78-2 Gundam");
        expect(userWithCollection?.collections[0].status).toBe("WISHLIST");
      });

      it("should handle Review->ReviewScore aggregation relationship", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const review = await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "Great kit!",
            content: "Really enjoyed building this",
            overallScore: 8.5
          }
        });

        const scores = [
          { category: "BUILD_QUALITY_ENGINEERING" as const, score: 9 },
          { category: "ARTICULATION_POSEABILITY" as const, score: 8 },
          { category: "DETAIL_ACCURACY" as const, score: 8 },
          { category: "AESTHETICS_PROPORTIONS" as const, score: 9 },
          { category: "ACCESSORIES_GIMMICKS" as const, score: 7 },
          { category: "VALUE_EXPERIENCE" as const, score: 9 }
        ];

        for (const score of scores) {
          await prisma.reviewScore.create({
            data: {
              reviewId: review.id,
              category: score.category,
              score: score.score
            }
          });
        }

        // Verify the relationship
        const reviewWithScores = await prisma.review.findUnique({
          where: { id: review.id },
          include: {
            categoryScores: true
          }
        });

        expect(reviewWithScores?.categoryScores).toHaveLength(6);
        expect(reviewWithScores?.overallScore).toBe(8.5);
      });

      it("should handle Build->BuildMilestone->BuildComment chain", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const build = await prisma.build.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            title: "My RX-78-2 Build",
            description: "First time building this kit",
            status: "IN_PROGRESS"
          }
        });

        await prisma.buildMilestone.create({
          data: {
            buildId: build.id,
            type: "BUILD",
            title: "Completed main body",
            description: "Finished assembling the torso and head",
            order: 1
          }
        });

        await prisma.buildComment.create({
          data: {
            buildId: build.id,
            userId: user.id,
            content: "Looking great so far!"
          }
        });

        // Verify the relationship chain
        const buildWithDetails = await prisma.build.findUnique({
          where: { id: build.id },
          include: {
            milestones: true,
            comments: {
              include: {
                user: true
              }
            }
          }
        });

        expect(buildWithDetails?.milestones).toHaveLength(1);
        expect(buildWithDetails?.milestones[0].type).toBe("BUILD");
        expect(buildWithDetails?.comments).toHaveLength(1);
        expect(buildWithDetails?.comments[0].content).toBe("Looking great so far!");
        expect(buildWithDetails?.comments[0].user.id).toBe(user.id);
      });

      it("should handle UserStore->MarketplaceListing connections", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const store = await prisma.userStore.create({
          data: {
            userId: user.id,
            name: "My Gunpla Store",
            description: "Selling my collection"
          }
        });

        await prisma.marketplaceListing.create({
          data: {
            storeId: store.id,
            kitId: kit.id,
            title: "RX-78-2 Gundam HG",
            description: "New in box",
            price: 1500, // 15.00 JPY
            currency: "JPY"
          }
        });

        // Verify the relationship chain
        const storeWithListings = await prisma.userStore.findUnique({
          where: { id: store.id },
          include: {
            listings: {
              include: {
                kit: true
              }
            }
          }
        });

        expect(storeWithListings?.listings).toHaveLength(1);
        expect(storeWithListings?.listings[0].kit.name).toBe("RX-78-2 Gundam");
        expect(storeWithListings?.listings[0].price).toBe(1500);
      });

      it("should handle Upload->User references with cascade delete", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const upload = await prisma.upload.create({
          data: {
            cloudinaryAssetId: "test-asset-123",
            publicId: "test-public-id",
            url: "https://example.com/image.jpg",
            format: "jpg",
            resourceType: "image",
            size: 1024000,
            originalFilename: "test-image.jpg",
            uploadedAt: new Date(),
            uploadedById: user.id
          }
        });

        // Verify the relationship
        const uploadWithUser = await prisma.upload.findUnique({
          where: { id: upload.id },
          include: {
            uploadedBy: true
          }
        });

        expect(uploadWithUser?.uploadedBy.id).toBe(user.id);

        // Delete the user and verify cascade delete
        await prisma.user.delete({
          where: { id: user.id }
        });

        const deletedUpload = await prisma.upload.findUnique({
          where: { id: upload.id }
        });

        expect(deletedUpload).toBeNull();
      });
    });

    describe("Constraint Violation Tests", () => {
      it("should enforce unique constraints on User email", async () => {
        await prisma.user.create({
          data: { id: "user1", email: "test@example.com" }
        });

        await expect(
          prisma.user.create({
            data: { id: "user2", email: "test@example.com" }
          })
        ).rejects.toThrow();
      });

      it("should allow duplicate Kit numbers (unique constraint was removed)", async () => {
        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit1 = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        const kit2 = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam Ver.2",
            number: "001", // Same number - should be allowed
            gradeId: grade.id
          }
        });

        expect(kit1.number).toBe("001");
        expect(kit2.number).toBe("001");
        expect(kit1.id).not.toBe(kit2.id);
      });

      it("should enforce unique constraints on UserKitCollection", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        await prisma.userKitCollection.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            status: "WISHLIST"
          }
        });

        await expect(
          prisma.userKitCollection.create({
            data: {
              userId: user.id,
              kitId: kit.id,
              status: "BACKLOG" // Same user-kit combination
            }
          })
        ).rejects.toThrow();
      });

      it("should enforce unique constraints on Review per user-kit", async () => {
        const user = await prisma.user.create({
          data: { id: "test-user", email: "test@example.com" }
        });

        const grade = await prisma.grade.create({
          data: { name: "HG" }
        });

        const kit = await prisma.kit.create({
          data: {
            name: "RX-78-2 Gundam",
            number: "001",
            gradeId: grade.id
          }
        });

        await prisma.review.create({
          data: {
            userId: user.id,
            kitId: kit.id,
            overallScore: 8.0
          }
        });

        await expect(
          prisma.review.create({
            data: {
              userId: user.id,
              kitId: kit.id,
              overallScore: 9.0 // Same user-kit combination
            }
          })
        ).rejects.toThrow();
      });
    });
  });
});
