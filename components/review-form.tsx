"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createReview, updateReview } from "@/lib/actions/reviews";
import {
  ReviewFormData,
  ReviewCategoryInfo,
  REVIEW_CATEGORIES,
  SCORE_CONSTRAINTS,
  getScoreLabel,
  validateScore,
  ReviewFormErrors
} from "@/lib/types/reviews";
import { ReviewCategory } from "@/generated/prisma";

interface ReviewFormProps {
  kitId: string;
  kitName: string;
  existingReview?: {
    id: string;
    title?: string;
    content?: string;
    categoryScores: Array<{
      category: ReviewCategory;
      score: number;
      notes?: string;
    }>;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  kitId,
  kitName,
  existingReview,
  onSuccess,
  onCancel
}: ReviewFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Initialize form data
  const [formData, setFormData] = useState<ReviewFormData>(() => {
    if (existingReview) {
      return {
        title: existingReview.title || "",
        content: existingReview.content || "",
        scores: REVIEW_CATEGORIES.map(categoryInfo => {
          const existingScore = existingReview.categoryScores.find(
            score => score.category === categoryInfo.category
          );
          return {
            category: categoryInfo.category,
            score: existingScore?.score || 5,
            notes: existingScore?.notes || "",
          };
        }),
      };
    }

    return {
      title: "",
      content: "",
      scores: REVIEW_CATEGORIES.map(categoryInfo => ({
        category: categoryInfo.category,
        score: 5,
        notes: "",
      })),
    };
  });

  const [errors, setErrors] = useState<ReviewFormErrors>({});

  // Calculate overall score
  const overallScore = Math.round(
    (formData.scores.reduce((sum, score) => sum + score.score, 0) / formData.scores.length) * 10
  ) / 10;

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: ReviewFormErrors = {};

    // Validate scores
    const scoreErrors: Record<ReviewCategory, string> = {} as Record<ReviewCategory, string>;
    let hasScoreErrors = false;

    formData.scores.forEach(score => {
      if (!validateScore(score.score)) {
        scoreErrors[score.category] = `Score must be between ${SCORE_CONSTRAINTS.MIN} and ${SCORE_CONSTRAINTS.MAX}`;
        hasScoreErrors = true;
      }
    });

    if (hasScoreErrors) {
      newErrors.scores = scoreErrors;
    }

    // Validate title length
    if (formData.title && formData.title.length > 200) {
      newErrors.title = "Title must be 200 characters or less";
    }

    // Validate content length
    if (formData.content && formData.content.length > 2000) {
      newErrors.content = "Content must be 2000 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle score change
  const handleScoreChange = (category: ReviewCategory, score: number) => {
    setFormData(prev => ({
      ...prev,
      scores: prev.scores.map(s =>
        s.category === category ? { ...s, score } : s
      ),
    }));

    // Clear score error for this category
    if (errors.scores?.[category]) {
      setErrors(prev => ({
        ...prev,
        scores: {
          ...prev.scores,
          [category]: undefined,
        },
      }));
    }
  };

  // Handle notes change
  const handleNotesChange = (category: ReviewCategory, notes: string) => {
    setFormData(prev => ({
      ...prev,
      scores: prev.scores.map(s =>
        s.category === category ? { ...s, notes } : s
      ),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    startTransition(async () => {
      try {
        if (existingReview) {
          await updateReview({
            reviewId: existingReview.id,
            title: formData.title || undefined,
            content: formData.content || undefined,
            scores: formData.scores,
          });
        } else {
          await createReview({
            kitId,
            title: formData.title || undefined,
            content: formData.content || undefined,
            scores: formData.scores,
          });
        }

        onSuccess?.();
        router.refresh();
      } catch (error) {
        setErrors({
          general: error instanceof Error ? error.message : "An error occurred while saving the review",
        });
      }
    });
  };

  return (
    <>
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          background: #3b82f6;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        input[type="range"]::-moz-range-track {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          border: none;
        }

        input[type="range"]::-moz-range-thumb {
          background: #3b82f6;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
      `}</style>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
        <CardTitle>
          {existingReview ? "Edit Review" : "Write a Review"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Reviewing: <span className="font-medium">{kitName}</span>
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {errors.general}
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Review Title (Optional)
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Give your review a title..."
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Category Scores */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Category Ratings</h3>
            <p className="text-sm text-muted-foreground">
              Rate each category from 1 (Poor) to 10 (Perfect)
            </p>

            <div className="grid gap-4">
              {formData.scores.map((scoreData) => {
                const categoryInfo = REVIEW_CATEGORIES.find(
                  info => info.category === scoreData.category
                )!;

                return (
                  <div key={scoreData.category} className="space-y-3 p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{categoryInfo.label}</h4>
                      <p className="text-sm text-muted-foreground">
                        {categoryInfo.description}
                      </p>
                    </div>

                    {/* Score Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Score: {scoreData.score}/10
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {getScoreLabel(scoreData.score)}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={SCORE_CONSTRAINTS.MIN}
                        max={SCORE_CONSTRAINTS.MAX}
                        value={scoreData.score}
                        onChange={(e) => handleScoreChange(scoreData.category, parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`,
                          backgroundSize: `${((scoreData.score - 1) / 9) * 100}% 100%`,
                          backgroundRepeat: "no-repeat",
                        }}
                      />

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1</span>
                        <span>2</span>
                        <span>3</span>
                        <span>4</span>
                        <span>5</span>
                        <span>6</span>
                        <span>7</span>
                        <span>8</span>
                        <span>9</span>
                        <span>10</span>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <label htmlFor={`notes-${scoreData.category}`} className="text-sm font-medium">
                        Notes (Optional)
                      </label>
                      <textarea
                        id={`notes-${scoreData.category}`}
                        value={scoreData.notes}
                        onChange={(e) => handleNotesChange(scoreData.category, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add specific notes about this category..."
                        rows={2}
                        maxLength={500}
                      />
                    </div>

                    {errors.scores?.[scoreData.category] && (
                      <p className="text-sm text-red-600">
                        {errors.scores[scoreData.category]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overall Score Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Score:</span>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">{overallScore}/10</span>
                <span className="text-sm text-muted-foreground">
                  ({getScoreLabel(Math.round(overallScore))})
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Average of all category scores
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Review Content (Optional)
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your thoughts about this kit..."
              rows={6}
              maxLength={2000}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.content.length}/2000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="min-w-[100px]"
            >
              {isPending ? "Saving..." : existingReview ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
