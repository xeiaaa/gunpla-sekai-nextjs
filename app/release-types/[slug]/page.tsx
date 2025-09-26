import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getReleaseTypeBySlug,
  getReleaseTypeKits,
  getReleaseTypeAnalytics,
} from "@/lib/actions/release-types";
import { KitCard } from "@/components/kit-card";

interface ReleaseTypeDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ReleaseTypeDetailPageProps) {
  const { slug } = await params;
  const releaseType = await getReleaseTypeBySlug(slug);

  if (!releaseType) {
    return {
      title: "Release Type Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${releaseType.name} - Gunpla Sekai`,
    description: `Explore ${releaseType.name} release type Gunpla kits`,
  };
}

export default async function ReleaseTypeDetail({
  params,
}: ReleaseTypeDetailPageProps) {
  const { slug } = await params;
  const releaseType = await getReleaseTypeBySlug(slug);

  if (!releaseType) {
    notFound();
  }

  // Get some recent kits for this release type
  const recentKits = await getReleaseTypeKits(releaseType.id, 20, 0);

  // Get analytics for this release type
  const analytics = await getReleaseTypeAnalytics(releaseType.id);

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
              <Link href="/kits">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Kits
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">{releaseType.name}</h1>
          <p className="text-lg opacity-90 max-w-3xl">
            Kits released through {releaseType.name} distribution
          </p>
          <div className="mt-4 text-sm opacity-75">
            {releaseType.kitsCount} kits
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Analytics Section */}
        {analytics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Grade Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {analytics.map(({ gradeName, count }) => (
                <div
                  key={gradeName}
                  className="bg-card border rounded-lg p-4 text-center"
                >
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-muted-foreground">
                    {gradeName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kits Section */}
        {recentKits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No kits found for {releaseType.name}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for {releaseType.name} content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {releaseType.name} Kits
              </h2>
              <p className="text-muted-foreground">
                All kits released through {releaseType.name}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentKits.map((kit) => (
                <KitCard key={kit.id} kit={kit} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
