# Proposed Database Schema Additions

This document outlines the planned additions to the Prisma schema to support all PRD features for Gunpla Sekai.

## Current Schema Status

✅ **Already Implemented:**

- Core kit database structure (Timeline, Series, MobileSuit, Grade, ProductLine, ReleaseType)
- Kit model with relationships and metadata
- Many-to-many kit/mobile suit relationships
- Upload system with Cloudinary integration
- Image management (KitUpload, MobileSuitUpload)

## Phase 1: User Management & Collections (Immediate Priority)

### User Model (Clerk Integration)

```prisma
// User model for Clerk integration
model User {
  id                String   @id // Clerk user ID
  email             String   @unique
  username          String?  @unique
  firstName         String?
  lastName          String?
  imageUrl          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  avatarUrl         String?
  isAdmin           Boolean     @default(false)

  // Relations
  collections       UserKitCollection[]
  builds           Build[]
  reviews          Review[]
  store            UserStore?
  uploads          Upload[] @relation("UploadedBy")

  @@map("users")
}
```

### Collection System

```prisma
// Collection status enum
enum CollectionStatus {
  WISHLIST
  BACKLOG
  BUILT
  STARRED
}

// User kit collections (wishlist, backlog, built, starred)
model UserKitCollection {
  id        String           @id @default(cuid())
  userId    String
  kitId     String
  status    CollectionStatus
  notes     String?
  addedAt   DateTime        @default(now())
  updatedAt DateTime        @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  kit  Kit  @relation(fields: [kitId], references: [id], onDelete: Cascade)

  @@unique([userId, kitId])
  @@map("user_kit_collections")
}
```

## Phase 2: Review System

### Review Models

```prisma
// Review categories enum
enum ReviewCategory {
  BUILD_QUALITY_ENGINEERING
  ARTICULATION_POSEABILITY
  DETAIL_ACCURACY
  AESTHETICS_PROPORTIONS
  ACCESSORIES_GIMMICKS
  VALUE_EXPERIENCE
}

// Main review model
model Review {
  id          String   @id @default(cuid())
  userId      String
  kitId       String
  title       String?
  content     String?
  overallScore Float   // Auto-calculated average of category scores (not user input)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  kit            Kit            @relation(fields: [kitId], references: [id], onDelete: Cascade)
  categoryScores ReviewScore[]

  @@unique([userId, kitId]) // One review per user per kit
  @@map("reviews")
}

// Individual category scores
model ReviewScore {
  id       String         @id @default(cuid())
  reviewId String
  category ReviewCategory
  score    Int            // 1-10 scale
  notes    String?

  // Relations
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)

  @@unique([reviewId, category])
  @@map("review_scores")
}

```

## Phase 3: Build Documentation

### Build System Models

```prisma
// Build status enum
enum BuildStatus {
  PLANNING
  IN_PROGRESS
  COMPLETED
  ON_HOLD
}

// Main build model
model Build {
  id          String      @id @default(cuid())
  userId      String
  kitId       String
  title       String
  description String?
  status      BuildStatus @default(PLANNING)
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  // Relations
  user       User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  kit        Kit             @relation(fields: [kitId], references: [id], onDelete: Cascade)
  milestones BuildMilestone[]
  comments   BuildComment[]

  @@map("builds")
}

// Build milestone types
enum MilestoneType {
  ACQUISITION
  PLANNING
  BUILD
  PAINTING
  PANEL_LINING
  DECALS
  TOPCOAT
  PHOTOGRAPHY
  COMPLETION
}

// Build milestones for progress tracking
model BuildMilestone {
  id          String        @id @default(cuid())
  buildId     String
  type        MilestoneType
  title       String
  description String?
  imageUrls   String[]      @default([])
  completedAt DateTime?
  order       Int
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  // Relations
  build Build @relation(fields: [buildId], references: [id], onDelete: Cascade)

  @@map("build_milestones")
}

// Build comments for community engagement
model BuildComment {
  id        String   @id @default(cuid())
  buildId   String
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  build Build @relation(fields: [buildId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("build_comments")
}
```

## Phase 4: Marketplace

### Marketplace Models

```prisma
// User store model
model UserStore {
  id          String   @id @default(cuid())
  userId      String   @unique
  name        String
  description String?
  location    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user     User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  listings MarketplaceListing[]

  @@map("user_stores")
}

// Marketplace listings
model MarketplaceListing {
  id          String   @id @default(cuid())
  storeId     String
  kitId       String
  title       String
  description String?
  price       Int      // Price in cents
  currency    String   @default("JPY")
  imageUrls   String[] @default([])
  available   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  store UserStore @relation(fields: [storeId], references: [id], onDelete: Cascade)
  kit   Kit       @relation(fields: [kitId], references: [id], onDelete: Cascade)

  @@map("marketplace_listings")
}
```

## Updates to Existing Models

### Kit Model Updates

```prisma
// Add to existing Kit model
model Kit {
  // ... existing fields remain unchanged ...

  // New relations to add:
  collections UserKitCollection[]
  reviews     Review[]
  builds      Build[]
  listings    MarketplaceListing[]
}
```

### Upload Model Updates

```prisma
// Update existing Upload model
model Upload {
  // ... existing fields remain unchanged ...
  uploadedById String // Change: Reference to User.id (Clerk ID)

  // New relation to add:
  uploadedBy User @relation("UploadedBy", fields: [uploadedById], references: [id], onDelete: Cascade)
}
```

## Performance Considerations

### Indexes to Add

```prisma
// Add these indexes for performance
model UserKitCollection {
  // ... fields ...

  @@index([userId])
  @@index([kitId])
  @@index([status])
  @@index([userId, status])
}

model Review {
  // ... fields ...

  @@index([kitId])
  @@index([userId])
  @@index([overallScore])
  @@index([createdAt])
}

model Build {
  // ... fields ...

  @@index([userId])
  @@index([kitId])
  @@index([status])
  @@index([createdAt])
}

model MarketplaceListing {
  // ... fields ...

  @@index([storeId])
  @@index([kitId])
  @@index([available])
  @@index([price])
  @@index([createdAt])
}
```

## Implementation Strategy

### Phase 1 Implementation Order:

1. Add User model with Clerk integration
2. Add UserKitCollection model
3. Update Kit model relations
4. Update Upload model with user reference
5. Create and run migrations
6. Set up Clerk webhooks for user sync

### Migration Considerations:

- User IDs will use Clerk's user IDs directly
- Existing uploads will need uploadedById populated (use system user or migration script)
- All new tables start empty - no data migration needed

### Clerk Integration Points:

- User creation/updates via webhooks
- Authentication middleware
- User profile synchronization
- Session management

## Next Steps

1. Implement Phase 1 (User + Collections) first
2. Test Clerk integration thoroughly
3. Add comprehensive indexes
4. Implement remaining phases incrementally
5. Performance testing and optimization

## References

- [Clerk User Management](../tech/nextjs-clerk.md)
- [Clerk Webhooks Setup](../tech/clerk-nextjs-webhooks.md)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Database Performance Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
