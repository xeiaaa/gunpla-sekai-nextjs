import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTimelineBySlug } from "@/lib/actions/timelines";
import { SeriesCard } from "@/components/series-card";

interface TimelineDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: TimelineDetailPageProps) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);

  if (!timeline) {
    return {
      title: "Timeline Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${timeline.name} - Gunpla Sekai`,
    description:
      timeline.description ||
      `Explore ${timeline.name} timeline and its series`,
  };
}

export default async function TimelineDetail({
  params,
}: TimelineDetailPageProps) {
  const { slug } = await params;
  const timeline = await getTimelineBySlug(slug);

  if (!timeline) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <Link href="/timelines">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Timelines
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">{timeline.name}</h1>
          {timeline.description && (
            <p className="text-lg opacity-90 max-w-3xl">
              {timeline.description}
            </p>
          )}
          <div className="mt-4 text-sm opacity-75">
            {timeline.seriesCount} series
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {timeline.series.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No series found in this timeline
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for series content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                Series in {timeline.name}
              </h2>
              <p className="text-muted-foreground">
                Explore the anime and manga series within this timeline
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {timeline.series.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
