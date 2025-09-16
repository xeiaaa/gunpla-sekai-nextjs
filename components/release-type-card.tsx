"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReleaseTypeCardProps {
  releaseType: {
    id: string;
    name: string;
    slug: string;
    kitsCount: number;
  };
}

export function ReleaseTypeCard({ releaseType }: ReleaseTypeCardProps) {
  return (
    <Link href={`/release-types/${releaseType.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{releaseType.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {releaseType.kitsCount} kits
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
