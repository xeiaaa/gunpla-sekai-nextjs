import { getAllTimelines } from "@/lib/actions/timelines";
import { TimelineCard } from "@/components/timeline-card";

export async function generateMetadata() {
  return {
    title: "Timelines - Gunpla Sekai",
    description: "Browse all Gundam universe timelines including Universal Century, After Colony, and more.",
  };
}

export default async function TimelinesPage() {
  const timelines = await getAllTimelines();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">Gundam Timelines</h1>
          <p className="text-lg opacity-90">
            Explore the different universes and timelines in the Gundam franchise
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {timelines.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No timelines found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for timeline content.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timelines.map((timeline) => (
              <TimelineCard key={timeline.id} timeline={timeline} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
