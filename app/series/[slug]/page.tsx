import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSeriesBySlug } from "@/lib/actions/series";
import { MobileSuitCard } from "@/components/mobile-suit-card";

interface SeriesDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SeriesDetailPageProps) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    return {
      title: "Series Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${series.name} - Gunpla Sekai`,
    description: series.description || `Explore ${series.name} series and its mobile suits`,
  };
}

export default async function SeriesDetail({ params }: SeriesDetailPageProps) {
  const series = await getSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/20">
              <Link href={series.timeline ? `/timelines/${series.timeline.slug}` : "/timelines"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {series.timeline ? series.timeline.name : "Timelines"}
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">{series.name}</h1>
          {series.timeline && (
            <div className="text-sm opacity-75 mb-2">
              Part of {series.timeline.name} timeline
            </div>
          )}
          {series.description && (
            <p className="text-lg opacity-90 max-w-3xl">{series.description}</p>
          )}
          <div className="mt-4 flex gap-6 text-sm opacity-75">
            <span>{series.mobileSuitsCount} mobile suits</span>
            <span>{series.kitsCount} kits</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {series.mobileSuits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No mobile suits found in this series</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for mobile suit content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Mobile Suits in {series.name}</h2>
              <p className="text-muted-foreground">
                Explore the mobile suits featured in this series
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {series.mobileSuits.map((mobileSuit) => (
                <MobileSuitCard key={mobileSuit.id} mobileSuit={mobileSuit} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
