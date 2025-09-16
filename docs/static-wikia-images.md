# Static Wikia Images Integration

This document explains how static.wikia.nocookie.net images are integrated and displayed in the Gunpla Sekai project.

## Overview

The project uses images scraped from the Gundam Wiki (static.wikia.nocookie.net) to display official artwork and photos of Gunpla kits, mobile suits, and series. These images are stored in the database and displayed using Next.js Image component with proper optimization.

## Configuration

### Next.js Image Configuration

The main configuration is in `next.config.mjs`:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wikia.nocookie.net",
        pathname: "/gundam/images/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};
```

**Key Points:**

- Uses `remotePatterns` (recommended over deprecated `domains`)
- Restricts to `/gundam/images/**` path for security
- Also includes Cloudinary for user-uploaded images

## Database Schema

### Scraped Images Storage

Images are stored as string arrays in the database:

```prisma
model Kit {
  // ... other fields
  scrapedImages String[] @default([])
}

model MobileSuit {
  // ... other fields
  scrapedImages String[] @default([])
}

model Series {
  // ... other fields
  scrapedImages String[] @default([])
}
```

### Migration History

- `20250909084656_add_scraped_images` - Added scrapedImages to kits and series
- `20250910161741_add_scraped_images_to_mobile_suit` - Added scrapedImages to mobile suits

## Data Population

### Source Data Structure

Images are sourced from `gunpla-kits/output/mecha/mecha-data.json`:

```json
{
  "slug": "_sengoku_astray_gundam",
  "name": "侍ノ弐 Sengoku Astray Gundam",
  "images": [
    "https://static.wikia.nocookie.net/gundam/images/6/67/Sengoku_Astray_-_Front.png/revision/latest/scale-to-width-down/268?cb=20130925162851",
    "https://static.wikia.nocookie.net/gundam/images/1/1b/Sengoku_Astray_Gundam_Rear.png/revision/latest/scale-to-width-down/268?cb=20150402132116"
  ],
  "url": "/wiki/%E4%BE%8D%E3%83%8E%E5%BC%90_Sengoku_Astray_Gundam",
  "seriesUrl": "/wiki/Gundam_Build_Fighters",
  "seriesSlug": "gundam_build_fighters"
}
```

### Population Scripts

#### 1. Mobile Suit Images

`scripts/update-mobile-suit-scraped-images.ts`:

- Reads mecha data from JSON file
- Updates mobile suit records with scraped images
- Matches by slug

#### 2. Kit Images

`scripts/seed-kit-mobile-suits.ts`:

- Processes kit data and mobile suit relationships
- Collects images from associated mobile suits
- Stores in kit's scrapedImages array

## Frontend Display

### Component Implementation

#### Kit Detail Component

```tsx
{
  kit.scrapedImages && kit.scrapedImages.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>Scraped Images</CardTitle>
        <CardDescription>
          Images automatically scraped from official sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kit.scrapedImages.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <Image
                src={imageUrl}
                alt={`${kit.name} scraped image ${index + 1}`}
                width={300}
                height={300}
                className="w-full h-48 rounded-lg shadow-md hover:shadow-lg transition-shadow object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Mobile Suit Detail Component

```tsx
{
  mobileSuit.scrapedImages && mobileSuit.scrapedImages.length > 0 && (
    <Card>
      <CardHeader>
        <CardTitle>Scraped Images</CardTitle>
        <CardDescription>
          {mobileSuit.scrapedImages.length} image
          {mobileSuit.scrapedImages.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mobileSuit.scrapedImages.map((imageUrl, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={imageUrl}
                alt={`${mobileSuit.name} scraped image ${index + 1}`}
                fill
                className="object-cover rounded-lg border"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Key Features

1. **Responsive Grid Layout**: Different grid configurations for different screen sizes
2. **Error Handling**: Images that fail to load are hidden
3. **Optimization**: Next.js Image component provides automatic optimization
4. **Accessibility**: Proper alt text for screen readers
5. **Performance**: Uses `fill` prop for responsive images with proper `sizes` attribute

## Image URL Structure

Static Wikia images follow this pattern:

```
https://static.wikia.nocookie.net/gundam/images/{path}/{filename}/revision/latest/scale-to-width-down/{width}?cb={timestamp}
```

**Components:**

- `static.wikia.nocookie.net` - CDN domain
- `/gundam/images/` - Base path for Gundam wiki images
- `{path}/{filename}` - Image path and filename
- `/revision/latest` - Always use latest revision
- `/scale-to-width-down/{width}` - Optional width scaling
- `?cb={timestamp}` - Cache buster parameter

## Benefits

1. **Official Content**: Images are from official Gundam Wiki
2. **Automatic Optimization**: Next.js handles image optimization
3. **CDN Performance**: Wikia's CDN provides fast global delivery
4. **Fallback Handling**: Graceful degradation when images fail
5. **Responsive Design**: Images adapt to different screen sizes

## Maintenance

### Adding New Images

1. Update the source JSON files in `gunpla-kits/output/`
2. Run the appropriate population scripts
3. Images will automatically appear in the UI

### Troubleshooting

- Check Next.js configuration for domain allowlist
- Verify image URLs are accessible
- Check browser network tab for failed requests
- Ensure proper error handling in components

## Security Considerations

- Images are restricted to `/gundam/images/**` path only
- No user input is used in image URLs
- All URLs are validated through the remotePatterns configuration
- Error handling prevents broken images from affecting layout
