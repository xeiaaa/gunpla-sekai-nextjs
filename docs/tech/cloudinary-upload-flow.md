# Cloudinary Upload System Documentation

This document explains how the Cloudinary upload system works in the Gunpla Sekai application, including the backend signature generation and frontend upload implementation.

## Overview

The application uses Cloudinary for image storage with a secure upload flow that involves:

1. **Backend**: Generating signed upload parameters using Cloudinary's API secret
2. **Frontend**: Using those parameters to upload directly to Cloudinary
3. **Database**: Storing upload metadata and relationships

## Architecture

```
Frontend Component → API Route → Cloudinary Utils → Cloudinary API
       ↓                ↓              ↓
   Upload Client → Signature Route → Cloudinary
       ↓
   Database Actions
```

## Backend Implementation

### 1. Cloudinary Configuration (`src/lib/cloudinary.ts`)

The core utility for generating upload signatures:

```typescript
export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
}

export function generateUploadSignature(
  folder: string = "uploads"
): UploadSignature {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const eager = "q_auto,f_auto";

  // Generate signature using Cloudinary's utility
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
      eager,
      use_filename: "true",
      unique_filename: "true",
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
```

**Key Features:**

- **Secure**: Uses API secret to generate signatures server-side
- **Optimized**: Includes `q_auto,f_auto` for automatic quality and format optimization
- **Organized**: Supports folder-based organization
- **Unique**: Ensures unique filenames to prevent conflicts

### 2. API Route (`src/app/api/upload/signature/route.ts`)

The endpoint that provides upload signatures to the frontend:

```typescript
export async function POST(request: NextRequest) {
  try {
    const { folder } = await request.json();
    const signature = generateUploadSignature(folder || "uploads");
    return NextResponse.json(signature);
  } catch (error) {
    console.error("Error generating upload signature:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
```

**Security Notes:**

- Only the signature is generated server-side
- API secret never exposed to frontend
- Timestamp prevents replay attacks

## Frontend Implementation

### 1. Upload Client (`src/lib/upload-client.ts`)

A simple client for requesting upload signatures:

```typescript
export async function getUploadSignature(
  folder: string = "uploads"
): Promise<UploadSignature> {
  const response = await fetch("/api/upload/signature", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    throw new Error("Failed to get upload signature");
  }

  return response.json();
}
```

### 2. Upload Components

The application has two main upload components:

#### Kit Image Upload (`src/components/kit-image-upload.tsx`)

**Features:**

- Multiple file upload
- Image type categorization (Box Art, Product Shots, Runners, Manual, Prototype)
- Caption support
- Preview before saving
- Batch save to database

**Upload Flow:**

1. User selects files
2. Get upload signature for 'kits' folder
3. Upload each file directly to Cloudinary
4. Store upload metadata in local state
5. User can add captions and categorize images
6. Save all images to database in batch

#### Mobile Suit Image Upload (`src/components/mobile-suit-image-upload.tsx`)

**Features:**

- Multiple file upload
- Immediate database storage
- Caption editing
- Image deletion

**Upload Flow:**

1. User selects files
2. Get upload signature for 'mobile-suits' folder
3. Upload each file directly to Cloudinary
4. Immediately save to database
5. Create mobile suit upload relationship

## Upload Process Details

### 1. Signature Generation

```typescript
// Backend generates signature with these parameters:
{
  timestamp: Math.round(new Date().getTime() / 1000),
  folder: 'kits' | 'mobile-suits',
  eager: 'q_auto,f_auto',
  use_filename: 'true',
  unique_filename: 'true',
}
```

### 2. Frontend Upload

```typescript
// Create form data for Cloudinary upload
const formData = new FormData();
formData.append("file", file);
formData.append("signature", signature.signature);
formData.append("timestamp", signature.timestamp.toString());
formData.append("api_key", signature.apiKey);
formData.append("folder", "kits");
formData.append("eager", "q_auto,f_auto");
formData.append("use_filename", "true");
formData.append("unique_filename", "true");

// Upload to Cloudinary
const uploadResponse = await fetch(
  `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
  {
    method: "POST",
    body: formData,
  }
);
```

### 3. Database Storage

After successful Cloudinary upload, the response contains:

```typescript
{
  asset_id: string,
  public_id: string,
  secure_url: string,
  eager: [{ secure_url: string }],
  format: string,
  resource_type: string,
  bytes: number,
  original_filename: string,
  created_at: string
}
```

This data is stored in the database with relationships to kits or mobile suits.

## Environment Variables

Required environment variables:

```env
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## Security Considerations

1. **API Secret Protection**: Never expose the API secret to the frontend
2. **Signature Validation**: Cloudinary validates signatures server-side
3. **Timestamp Protection**: Signatures include timestamps to prevent replay attacks
4. **Folder Organization**: Images are organized in specific folders (kits, mobile-suits)

## Image Optimization

The system automatically applies Cloudinary optimizations:

- **Quality**: `q_auto` - Automatic quality optimization
- **Format**: `f_auto` - Automatic format selection (WebP, AVIF when supported)
- **Eager Transformations**: Pre-generated optimized versions

## Usage Examples

### Basic Upload Flow

```typescript
// 1. Get signature
const signature = await getUploadSignature("kits");

// 2. Upload file
const formData = new FormData();
formData.append("file", file);
formData.append("signature", signature.signature);
formData.append("timestamp", signature.timestamp.toString());
formData.append("api_key", signature.apiKey);
formData.append("folder", "kits");
formData.append("eager", "q_auto,f_auto");
formData.append("use_filename", "true");
formData.append("unique_filename", "true");

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${signature.cloudName}/auto/upload`,
  { method: "POST", body: formData }
);

const result = await response.json();

// 3. Save to database
await createUpload({
  cloudinaryAssetId: result.asset_id,
  publicId: result.public_id,
  url: result.secure_url,
  eagerUrl: result.eager?.[0]?.secure_url,
  format: result.format,
  resourceType: result.resource_type,
  size: result.bytes,
  originalFilename: result.original_filename,
  uploadedAt: new Date(result.created_at),
  uploadedById: "system",
});
```

## Error Handling

The system includes comprehensive error handling:

1. **Signature Generation Errors**: Caught in API route
2. **Upload Errors**: Caught in upload components
3. **Database Errors**: Caught in action functions
4. **User Feedback**: Error messages displayed to users

## Performance Considerations

1. **Direct Upload**: Files upload directly to Cloudinary, not through your server
2. **Parallel Uploads**: Multiple files can be uploaded simultaneously
3. **Optimized Images**: Automatic quality and format optimization
4. **Eager Transformations**: Pre-generated optimized versions for faster loading

## Future Enhancements

Potential improvements:

1. **Progress Indicators**: Show upload progress for large files
2. **Image Compression**: Client-side compression before upload
3. **Drag & Drop**: Enhanced file selection interface
4. **Batch Operations**: Bulk image management features
5. **Image Editing**: Basic editing capabilities (crop, rotate, etc.)
