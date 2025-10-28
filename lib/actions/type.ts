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
