import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineCardProps {
  timeline: {
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    seriesCount: number;
  };
}

export function TimelineCard({ timeline }: TimelineCardProps) {
  return (
    <Link href={`/timelines/${timeline.slug}`}>
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{timeline.name}</CardTitle>
          {timeline.description && (
            <CardDescription className="line-clamp-3">
              {timeline.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{timeline.seriesCount} series</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
