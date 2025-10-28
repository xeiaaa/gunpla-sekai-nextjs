export interface KitResponse {
  id: string;
  name: string;
  slug: string;
  number: string | null;
  variant: string | null;
  releaseDate: string | null;
  priceYen: number | null;
  boxArt: string | null;
  scrapedImages: string[];
  productLine?: {
    id: string;
    name: string;
    slug: string;
    grade?: {
      name: string;
    } | null;
  } | null;
  series?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  mobileSuits: {
    mobileSuit: {
      name: string;
    };
  }[];
  _count: {
    mobileSuits: number;
  };
}

export interface ReleaseTypeResponse {
  id: string
  name: string
  slug: string
  logoUrl?: string
  bannerUrl?: string
  createdAt: string
  updatedAt: string
  _count?: {
    kits?: number;
  };

}

export interface ProductLine {
  id: string;
  name: string;
  slug: string;
  grade?: {
    name: string;
  };
  description?: string
  gradeId?: string
  vendorId?: string
  logoId?: string
  logoUrl?: string
  bannerUrl?: string
  scrapedImage?: string
  createdAt?: string
  updatedAt?: string
  _count?: {
    kits?: number;
  };
}

export interface MobileSuitResponse {
  id: string
  name: string
  slug?: string
  description?: string
  seriesId?: string
  scrapedImages: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TimelineResponse {
  id: string
  name: string
  slug?: string
  description?: string
  createdAt: Date
  updatedAt: Date
  _count?: {
    series?: number;
  };
}

export interface SeriesResponse {
  id: string
  name: string
  slug?: string
  description?: string
  timelineId?: string
  logoUrl?: string
  bannerUrl?: string
  scrapedImages: string[]
  createdAt: Date
  updatedAt: Date
  _count?: {
    kits?: number;
    mobileSuits?: number;
  };

  timeline?: TimelineResponse
  mobileSuits?: MobileSuitResponse[]
  kits?: KitResponse[]

}

export interface ListResult<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

enum KitImageType {
  BOX_ART = "BOX_ART",
  PRODUCT_SHOTS = "PRODUCT_SHOTS",
  RUNNERS = "RUNNERS",
  MANUAL = "MANUAL",
  PROTOTYPE = "PROTOTYPE",
}


export interface UploadResponse {
  id: string
  cloudinaryAssetId: string
  publicId: string
  url: string
  eagerUrl?: string
  format: string
  resourceType: string
  size: number
  pages: number
  originalFilename: string
  uploadedAt: Date
  uploadedById: string
  createdAt: Date
  updatedAt: Date
}

export interface KitUploadResponse {
  id: string
  kitId: string
  uploadId: string
  caption?: string
  order?: number
  type: KitImageType
  createdAt: Date
  updatedAt: Date
  kit?: KitResponse
  upload?: UploadResponse

}

export interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  youtubeUrl: string | null;
  portfolioUrl: string | null;
  themeColor: string | null;
  isPublic: boolean;
  showCollections: boolean;
  showBuilds: boolean;
  showActivity: boolean;
  showBadges: boolean;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;

  builds: number;
  collections: number;
  reviews: number;
}

