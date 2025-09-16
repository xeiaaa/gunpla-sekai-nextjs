"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GradeCardProps {
  grade: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    kitsCount: number;
    productLinesCount: number;
  };
}

export function GradeCard({ grade }: GradeCardProps) {
  return (
    <Link href={`/grades/${grade.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{grade.name}</CardTitle>
          {grade.description && (
            <CardDescription className="line-clamp-3">
              {grade.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{grade.kitsCount} kits</span>
            <span>{grade.productLinesCount} product lines</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
