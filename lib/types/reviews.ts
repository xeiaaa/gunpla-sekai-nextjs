import { ReviewCategory } from "@/generated/prisma";

// Review form data types
export interface ReviewFormData {
  title?: string;
  content?: string;
  scores: CategoryScoreFormData[];
}

export interface CategoryScoreFormData {
  category: ReviewCategory;
  score: number;
  notes?: string;
}

// Review display types
export interface ReviewWithDetails {
  id: string;
  title?: string;
  content?: string;
  overallScore: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
  categoryScores: CategoryScore[];
}

export interface CategoryScore {
  id: string;
  category: ReviewCategory;
  score: number;
  notes?: string;
}

// Review statistics types
export interface ReviewStats {
  totalReviews: number;
  averageScore: number;
  categoryAverages: CategoryAverage[];
}

export interface CategoryAverage {
  category: ReviewCategory;
  averageScore: number;
  reviewCount: number;
}

// Review category display information
export interface ReviewCategoryInfo {
  category: ReviewCategory;
  label: string;
  description: string;
  icon?: string;
}

// Constants for review categories
export const REVIEW_CATEGORIES: ReviewCategoryInfo[] = [
  {
    category: ReviewCategory.BUILD_QUALITY_ENGINEERING,
    label: "Build Quality & Engineering",
    description: "How well the kit fits together, part quality, and engineering design",
  },
  {
    category: ReviewCategory.ARTICULATION_POSEABILITY,
    label: "Articulation & Poseability",
    description: "Range of motion, joint quality, and ability to achieve dynamic poses",
  },
  {
    category: ReviewCategory.DETAIL_ACCURACY,
    label: "Detail & Accuracy",
    description: "Level of detail, accuracy to source material, and surface details",
  },
  {
    category: ReviewCategory.AESTHETICS_PROPORTIONS,
    label: "Aesthetics & Proportions",
    description: "Visual appeal, color accuracy, and proportional correctness",
  },
  {
    category: ReviewCategory.ACCESSORIES_GIMMICKS,
    label: "Accessories & Gimmicks",
    description: "Weapons, accessories, special features, and play value",
  },
  {
    category: ReviewCategory.VALUE_EXPERIENCE,
    label: "Value & Experience",
    description: "Overall value for money and building experience",
  },
];

// Score validation constants
export const SCORE_CONSTRAINTS = {
  MIN: 1,
  MAX: 10,
} as const;

// Score labels for display
export const SCORE_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Average",
  4: "Fair",
  5: "Good",
  6: "Very Good",
  7: "Great",
  8: "Excellent",
  9: "Outstanding",
  10: "Perfect",
};

// Helper functions
export function getCategoryInfo(category: ReviewCategory): ReviewCategoryInfo {
  return REVIEW_CATEGORIES.find(info => info.category === category) || {
    category,
    label: category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    description: "No description available",
  };
}

export function getScoreLabel(score: number): string {
  return SCORE_LABELS[score] || "Unknown";
}

export function validateScore(score: number): boolean {
  return score >= SCORE_CONSTRAINTS.MIN &&
    score <= SCORE_CONSTRAINTS.MAX &&
    Number.isInteger(score);
}

// Form validation types
export interface ReviewFormErrors {
  title?: string;
  content?: string;
  scores?: Record<ReviewCategory, string>;
  general?: string;
}

export interface ReviewFormState {
  data: ReviewFormData;
  errors: ReviewFormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}
