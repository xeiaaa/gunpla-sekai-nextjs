# Meilisearch Sync Script

This script synchronizes your database data with Meilisearch for fast, typo-tolerant search functionality.

## Prerequisites

1. **Environment Variables**: Make sure you have the following variables in your `.env` file:

   ```env
   MEILI_HOST_URL="http://localhost:7700"  # or your Meilisearch instance URL
   MEILI_MASTER_KEY="your-master-key"      # your Meilisearch master key
   ```

2. **Meilisearch Instance**: Ensure your Meilisearch instance is running and accessible.

## Usage

### Sync Data to Meilisearch

Run the sync script using npm:

```bash
npm run sync:meilisearch
```

Or run it directly with tsx:

```bash
npx tsx scripts/sync-meilisearch.ts
```

### Test Environment Variables

Before running the sync, you can test if your environment variables are properly configured:

```bash
npm run test:env
```

### Clear All Indexes

To clear all Meilisearch indexes (useful for testing or starting fresh):

```bash
npm run clear:meilisearch
```

## What Gets Synced

The script creates and populates the following Meilisearch indexes:

### 1. **Kits** (`kits`)

- All Gunpla kit data with full-text search
- Includes related data: product line, grade, series, timeline, mobile suits
- Searchable fields: name, number, variant, notes, product line, grade, series, mobile suits
- Filterable by: product line, grade, series, timeline, release type, price, release date

### 2. **Mobile Suits** (`mobile-suits`)

- All mobile suit data
- Includes related series and timeline information
- Searchable fields: name, description, series, timeline

### 3. **Series** (`series`)

- All anime/manga series data
- Includes timeline information
- Searchable fields: name, description, timeline

### 4. **Product Lines** (`product-lines`)

- All product line data (HGUC, MGEX, etc.)
- Includes grade information
- Searchable fields: name, description, grade

### 5. **Grades** (`grades`)

- All grade data (HG, RG, MG, PG, etc.)
- Searchable fields: name, description

### 6. **Users** (`users`)

- All user profiles
- Searchable fields: username, first name, last name, email, bio

### 7. **Builds** (`builds`)

- All user builds
- Includes user and kit information
- Searchable fields: title, description, user info, kit info

### 8. **Reviews** (`reviews`)

- All kit reviews
- Includes user and kit information
- Searchable fields: title, content, user info, kit info

## Index Configuration

Each index is configured with:

- **Searchable attributes**: Fields that can be searched
- **Filterable attributes**: Fields that can be used for filtering
- **Sortable attributes**: Fields that can be used for sorting
- **Ranking rules**: How search results are ranked

## Search Features

The sync script enables:

- **Typo tolerance**: Finds results even with spelling mistakes
- **Multi-field search**: Searches across multiple related fields
- **Filtering**: Filter results by various attributes
- **Sorting**: Sort results by relevance, date, price, etc.
- **Faceted search**: Group results by categories

## Re-running the Script

The script is safe to run multiple times:

- It will update existing indexes if they already exist
- It will add new documents and update existing ones
- No data will be duplicated

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your Meilisearch instance is running and the URL is correct
2. **Authentication Error**: Verify your master key is correct
3. **Database Connection**: Ensure your database is accessible and the Prisma client is properly configured

### Logs

The script provides detailed logging:

- ✅ Success indicators for completed operations
- ℹ️ Information about existing indexes
- ❌ Error messages with details

## Integration

To use the search functionality in your application, you'll need to:

1. Install the Meilisearch client in your frontend
2. Create search components that query the appropriate indexes
3. Implement search result display and filtering

Example frontend integration:

```typescript
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILI_HOST_URL!,
  apiKey: process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY!, // Use search key, not master key
});

// Search kits
const results = await client.index("kits").search("RX-78-2", {
  filter: 'productLine.grade.name = "HG"',
  sort: ["releaseDate:desc"],
});
```
