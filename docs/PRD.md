# Gunpla Sekai – Product Requirements Document

## Overview

**Gunpla Sekai** is a comprehensive community platform for Gundam model kit (Gunpla) enthusiasts. It serves as the definitive database, marketplace, and social hub for collectors and builders worldwide. The platform addresses the fragmented nature of current Gunpla resources by providing:

- **The most detailed Gunpla database** with advanced search and filtering capabilities
- **Community-driven collection management** with wishlist, backlog, and build tracking
- **Comprehensive review system** with 6-category scoring for informed purchasing decisions
- **User-generated marketplace** for buying/selling kits with inventory management
- **Social features** for sharing builds, milestones, and community engagement

**Target Users:**

- **Collectors**: Managing extensive kit collections and wishlists
- **Builders**: Documenting build progress and sharing techniques
- **Newcomers**: Discovering kits through reviews and community recommendations
- **Sellers**: Managing inventory and reaching potential buyers

## Core Features

### 1. Kits Database & Advanced Search

**What it does:** Provides the most comprehensive Gunpla database with sophisticated filtering and search capabilities.

**Why it's important:** Current resources lack detailed metadata and advanced filtering, making kit discovery frustrating for users with specific preferences.

**How it works:**

- **Multi-select filters**: Grade, Product Line, Series, Timeline, Mobile Suits, Release Type
- **Range filters**: Release Date, Review scores (e.g., "aesthetics > 8")
- **Full-text search**: Powered by Meilisearch for fast, typo-tolerant search
- **Advanced sorting**: By review scores, release date, price, community ratings
- **Relationship-based discovery**: Find variants, base kits, and related mobile suits

### 2. User Collection Management

**What it does:** Comprehensive personal collection tracking across four distinct categories.

**Why it's important:** Collectors need organized ways to track ownership status and build progress, currently scattered across spreadsheets and notes.

**How it works:**

- **Wishlist**: Kits desired but not owned
- **Backlog**: Owned kits awaiting construction
- **Builds**: Completed kits (publicly viewable with photos/reviews)
- **Starred**: Quick-access favorites for reference
- **Status transitions**: Seamless movement between categories as ownership/build status changes

### 3. 6-Category Review System

**What it does:** Structured review system breaking down kit quality across specific evaluation criteria.

**Why it's important:** Generic 5-star ratings don't capture the nuanced aspects that matter to builders (articulation vs. aesthetics vs. build quality).

**How it works:**

- **Gated reviews**: Only users with kits marked as "built" can review
- **Six scoring categories** (1-10 scale):
  1. **Build Quality & Engineering** – Part fit, stability, construction design
  2. **Articulation & Poseability** – Range of motion and posing capability
  3. **Detail & Accuracy** – Screen accuracy, panel lines, color separation
  4. **Aesthetics & Proportions** – Visual appeal and shelf presence
  5. **Accessories & Gimmicks** – Weapons, effect parts, special features
  6. **Value & Experience** – Price-to-quality ratio and build enjoyment
- **Contextual notes**: Optional explanatory text for each category
- **Aggregate scoring**: Powers advanced filtering and sorting

### 4. Comprehensive Kit Detail Pages

**What it does:** Central hub for all kit-related information, relationships, and community content.

**Why it's important:** Users need a single source of truth for kit information, including community insights and purchasing options.

**How it works:**

- **Core metadata**: Release info, pricing, descriptions, official images
- **Relationship mapping**: Base kits, variants, sibling kits, associated mobile suits
- **Community content**: User builds, reviews, marketplace listings
- **Store integration**: Both community sellers and official retailer listings

### 5. User-Generated Marketplace

**What it does:** Facebook Marketplace-style system for community buying/selling with inventory management.

**Why it's important:** Current marketplaces lack Gunpla-specific features and don't integrate with collection management.

**How it works:**

- **One store per user**: Personal inventory system
- **Database-driven listings**: Select kits directly from the main database
- **Custom descriptions**: Box condition, modifications, etc.
- **Transaction integration**: Automatic backlog addition for buyers
- **No payment processing**: Facilitates contact, users handle transactions externally

### 6. Build Documentation & Milestones

**What it does:** Comprehensive build progress tracking with milestone-based documentation.

**Why it's important:** Builders want to document their journey and share techniques, while others learn from the process.

**How it works:**

- **Milestone system**: Step-by-step progress tracking
  - Kit acquisition
  - Build phases (head, torso, limbs, etc.)
  - Completion stages
  - Post-processing (panel lining, topcoating)
  - Final photography
- **Rich media**: Multiple images per milestone with captions
- **Social sharing**: Shareable build pages for external platforms
- **Community engagement**: Comments and ratings on completed builds

### 7. Browse by Universe Structure

**What it does:** Hierarchical browsing through Timeline → Series → Mobile Suits → Kits.

**Why it's important:** Fans often seek kits from specific series or featuring particular mobile suits, requiring intuitive navigation.

**How it works:**

- **Timeline pages**: Universal Century, After Colony, etc.
- **Series pages**: Individual anime/manga series within timelines
- **Mobile Suit pages**: Specific mecha with all available kit variations
- **Many-to-many relationships**: Mobile suits can appear across multiple series

## User Experience

### User Personas

**The Collector (Primary)**

- **Goals**: Catalog extensive collection, track wishlists, find rare variants
- **Pain Points**: Disorganized tracking, difficulty finding specific kits
- **Usage**: Heavy filtering, collection management, marketplace browsing

**The Builder (Primary)**

- **Goals**: Document builds, share techniques, get community feedback
- **Pain Points**: Limited platforms for build documentation, lack of structured feedback
- **Usage**: Build milestone creation, review writing, community engagement

**The Newcomer (Secondary)**

- **Goals**: Discover recommended kits, learn from experienced builders
- **Pain Points**: Overwhelming choices, unreliable review sources
- **Usage**: Browse by series, read reviews, follow experienced builders

**The Seller (Secondary)**

- **Goals**: Efficiently manage inventory, reach targeted buyers
- **Pain Points**: Generic marketplaces don't understand Gunpla specifics
- **Usage**: Store management, listing creation, buyer communication

### Key User Flows

**Kit Discovery Flow:**

1. User enters search query or applies filters
2. Browse results with sorting options
3. View kit detail page with relationships
4. Read community reviews and builds
5. Add to collection category or marketplace cart

**Build Documentation Flow:**

1. Mark kit as "built" in collection
2. Create build entry with initial milestone
3. Add subsequent milestones with photos/notes
4. Publish completed build for community
5. Receive feedback through comments/ratings

**Marketplace Flow:**

1. Seller creates store and adds inventory
2. Buyer discovers kit through search/browsing
3. Contact initiated through platform
4. External transaction completion
5. Optional: Automatic collection status update

### UI/UX Considerations

**Design Principles:**

- **Database-first**: All features built around the comprehensive kit database
- **Mobile-responsive**: Touch-friendly interfaces for on-the-go browsing
- **Visual-heavy**: High-quality images central to all kit presentations
- **Progressive disclosure**: Complex filtering options available but not overwhelming
- **Community-centric**: Social features integrated throughout, not siloed

**Key Interface Elements:**

- **Advanced filter sidebar**: Collapsible, multi-select with clear indicators
- **Kit cards**: Consistent layout showing key info, images, and quick actions
- **Collection status indicators**: Clear visual cues for ownership/build status
- **Review score visualization**: Radar charts or bar graphs for 6-category scores
- **Milestone timeline**: Visual progress tracking for builds

## Technical Architecture

### System Components

**Frontend (Next.js 15)**

- **App Router**: File-based routing with nested layouts
- **Server Components**: Optimized data fetching and SEO
- **Client Components**: Interactive features (filters, forms, real-time updates)
- **Tailwind CSS v4**: Utility-first styling with custom design system
- **Shadcn/ui**: Consistent component library with accessibility

**Backend Services**

- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Meilisearch**: Full-text search engine for kit discovery
- **Clerk**: Authentication and user management
- **Cloudinary**: Image storage and optimization
- **Server Actions**: Form handling and data mutations

**Database (PostgreSQL)**

- **Normalized schema**: Efficient relationships between kits, users, reviews
- **Full-text search**: Complementary to Meilisearch for complex queries
- **Audit trails**: Track changes to critical data (reviews, collections)
- **Performance optimization**: Indexes on frequently queried fields

### Data Models

**Core Entities:**

- **Kit**: Central entity with metadata, relationships, and media
- **User**: Authentication, profiles, and collection management
- **Review**: 6-category scoring with validation rules
- **Build**: Milestone-based documentation with media
- **Store**: User inventory with kit references and descriptions

**Relationships:**

- **Kit ↔ Mobile Suit**: Many-to-many (kits can feature multiple suits)
- **Kit ↔ Kit**: Self-referencing for base/variant relationships
- **User ↔ Kit**: Collection status tracking (wishlist, backlog, built, starred)
- **Build ↔ Milestone**: One-to-many with ordered progression

### APIs and Integrations

**Internal APIs:**

- **Kit Search API**: Meilisearch integration with filter translation
- **Collection API**: CRUD operations for user kit relationships
- **Review API**: Validation and aggregation logic
- **Marketplace API**: Store and listing management

**External Integrations:**

- **Clerk Webhooks**: User lifecycle management
- **Cloudinary API**: Image upload and transformation
- **Web Scrapers**: Official store price monitoring (future)
- **Social Sharing**: Open Graph meta tags for external platforms

### Infrastructure Requirements

**Development:**

- **Local PostgreSQL**: Docker container for consistent development
- **Local Meilisearch**: Docker container with kit data indexing
- **Vercel Preview**: Branch-based deployments for testing

**Production:**

- **Vercel Platform**: Next.js hosting with edge functions
- **Supabase/Neon**: Managed PostgreSQL with connection pooling
- **Meilisearch Cloud**: Managed search service with high availability
- **Cloudinary**: CDN and image optimization

## Development Roadmap

### Phase 1: Foundation & MVP (Core Database + Basic Features)

**Scope**: Establish core architecture and basic kit browsing functionality

**Features:**

- ✅ **Database schema**: Complete Prisma models for kits, series, mobile suits
- ✅ **Basic kit listing**: Display kits with filtering by grade, product line
- ✅ **Kit detail pages**: Core information, images, relationships
- **Authentication**: Clerk integration with user profiles
- **Basic search**: Meilisearch setup with kit indexing
- **Responsive design**: Mobile-first UI with Tailwind + Shadcn

**Deliverable**: Functional kit database with search and basic user accounts

### Phase 2: Collection Management (User Features)

**Scope**: Personal collection tracking and user-generated content foundation

**Features:**

- **Collection system**: Wishlist, backlog, built, starred categories
- **User profiles**: Public profiles showing collections and activity
- **Basic build creation**: Simple build entries without milestones
- **Image upload**: Cloudinary integration for user content
- **Collection statistics**: Personal analytics and progress tracking

**Deliverable**: Users can manage collections and create basic build entries

### Phase 3: Review System (Community Validation)

**Scope**: Comprehensive review system to validate kit quality

**Features:**

- **6-category review system**: Structured scoring with validation
- **Review aggregation**: Calculate and display average scores
- **Advanced filtering**: Filter kits by review scores and criteria
- **Review moderation**: Basic reporting and moderation tools
- **Review helpfulness**: Community voting on review quality

**Deliverable**: Robust review system enabling data-driven kit discovery

### Phase 4: Enhanced Build Documentation (Social Features)

**Scope**: Advanced build tracking with milestone system and community engagement

**Features:**

- **Milestone system**: Step-by-step build progress tracking
- **Build galleries**: Rich media presentation with multiple images
- **Build comments**: Community feedback and discussion
- **Build ratings**: Simple 5-star rating system for completed builds
- **Social sharing**: Open Graph integration for external sharing
- **Build discovery**: Browse builds by kit, builder, or recency

**Deliverable**: Comprehensive build documentation platform with social features

### Phase 5: Marketplace Integration (E-commerce)

**Scope**: User-generated marketplace with inventory management

**Features:**

- **User stores**: One store per user with custom branding
- **Inventory management**: Add kits from database with stock tracking
- **Listing creation**: Custom descriptions, pricing, condition notes
- **Buyer-seller messaging**: In-platform communication system
- **Transaction integration**: Automatic collection updates post-purchase
- **Store discovery**: Browse stores by location, specialization, ratings

**Deliverable**: Functional marketplace connecting buyers and sellers

### Phase 6: Advanced Features (Platform Maturity)

**Scope**: Sophisticated features for power users and platform optimization

**Features:**

- **Advanced analytics**: Personal and community statistics dashboards
- **Recommendation engine**: ML-powered kit suggestions based on preferences
- **Official store integration**: Automated price monitoring and affiliate links
- **Mobile app**: React Native app for on-the-go access
- **API access**: Public API for third-party integrations
- **Advanced moderation**: Automated content filtering and community tools

**Deliverable**: Mature platform with advanced features and ecosystem integrations

## Logical Dependency Chain

### Foundation First (Phase 1)

**Critical Path**: Database → Authentication → Basic UI → Search

- **Database schema** must be complete before any feature development
- **Authentication** required for any user-specific features
- **Basic kit display** validates core data model and UI patterns
- **Search functionality** essential for kit discovery

### User Features (Phase 2)

**Dependencies**: Foundation complete

- **Collection management** builds on authenticated users and kit database
- **User profiles** require collection system for meaningful content
- **Image upload** needed before rich build documentation

### Community Validation (Phase 3)

**Dependencies**: User features established

- **Review system** requires users with build collections
- **Review aggregation** needed before advanced filtering
- **Community trust** established through review quality

### Social Platform (Phase 4)

**Dependencies**: Community validation active

- **Build milestones** extend basic build creation from Phase 2
- **Social features** require established user base and content
- **External sharing** drives growth and user acquisition

### Marketplace (Phase 5)

**Dependencies**: Social platform mature

- **User trust** established through community interactions
- **Content volume** sufficient to attract buyers and sellers
- **Platform stability** proven through previous phases

### Platform Maturity (Phase 6)

**Dependencies**: All core features operational

- **Analytics** require substantial data volume
- **ML features** need user behavior patterns
- **API access** demands stable, well-tested platform

## Risks and Mitigations

### Technical Challenges

**Risk**: Meilisearch integration complexity with PostgreSQL sync

- **Mitigation**: Start with simple indexing, implement incremental sync later
- **Fallback**: PostgreSQL full-text search as temporary solution

**Risk**: Image storage costs with user-generated content

- **Mitigation**: Implement upload limits, image compression, and cleanup policies
- **Monitoring**: Track storage usage and costs from Phase 2 onward

**Risk**: Database performance with complex filtering and relationships

- **Mitigation**: Careful indexing strategy, query optimization, and caching
- **Scaling**: Connection pooling and read replicas as needed

### Product Challenges

**Risk**: Insufficient kit database completeness at launch

- **Mitigation**: Focus on popular kits first, implement community contribution tools
- **Strategy**: Partner with existing databases for initial data import

**Risk**: Low user adoption without established community

- **Mitigation**: Seed platform with quality content, engage existing communities
- **Growth**: Focus on specific niches (e.g., UC timeline) before expanding

**Risk**: Marketplace trust and safety concerns

- **Mitigation**: Start with simple contact facilitation, add safety features iteratively
- **Community**: Leverage review system for seller reputation

### Resource Constraints

**Risk**: Feature scope too ambitious for development timeline

- **Mitigation**: Strict phase-based development, MVP focus in each phase
- **Prioritization**: Core database and search functionality non-negotiable

**Risk**: Content moderation overhead as platform grows

- **Mitigation**: Community self-moderation tools, automated filtering
- **Scaling**: Establish moderation policies and volunteer moderator program

### MVP Definition and Buildability

**Core MVP** (Phase 1):

- Comprehensive kit database with search
- Basic user accounts and authentication
- Responsive kit browsing with filtering
- Kit detail pages with relationships

**Success Criteria**: Users can discover and research kits effectively, establishing platform value before social features.

**Build-Upon Strategy**: Each phase adds value independently while enabling subsequent features. Database-first approach ensures solid foundation for all user features.

## Appendix

### Technical Specifications

**Performance Targets:**

- **Page Load Time**: <2s for kit listings, <1s for cached content
- **Search Response**: <200ms for typical queries
- **Image Loading**: Progressive loading with optimized formats
- **Mobile Performance**: 90+ Lighthouse score on mobile

**SEO Requirements:**

- **Static Generation**: Kit detail pages for search engine indexing
- **Structured Data**: Schema.org markup for kit information
- **Meta Tags**: Dynamic Open Graph tags for social sharing
- **Sitemap**: Automated sitemap generation for all public content

**Accessibility Standards:**

- **WCAG 2.1 AA**: Compliance across all interactive elements
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets accessibility requirements

### Research Findings

**Market Analysis:**

- **Existing platforms**: HobbyLink Japan, 1999.co.jp lack community features
- **Social platforms**: Reddit r/Gunpla active but lacks structured data
- **Database resources**: Gundam Wiki comprehensive but not kit-focused

**User Research:**

- **Collection management**: Currently done via spreadsheets or notes
- **Purchase decisions**: Heavily influenced by build photos and reviews
- **Community engagement**: High interest in sharing builds and techniques
- **Mobile usage**: Significant browsing on mobile devices during shopping

**Competitive Advantages:**

- **Structured reviews**: 6-category system vs. generic ratings
- **Collection integration**: Seamless status tracking across lifecycle
- **Community marketplace**: Gunpla-specific vs. generic platforms
- **Build documentation**: Milestone system vs. simple photo galleries
