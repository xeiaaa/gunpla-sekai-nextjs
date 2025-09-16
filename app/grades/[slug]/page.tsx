import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGradeBySlug, getGradeKits } from "@/lib/actions/grades";
import { ProductLineCard } from "@/components/product-line-card";
import { KitCard } from "@/components/kit-card";

interface GradeDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: GradeDetailPageProps) {
  const grade = await getGradeBySlug(params.slug);

  if (!grade) {
    return {
      title: "Grade Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${grade.name} - Gunpla Sekai`,
    description: grade.description || `Explore ${grade.name} grade Gunpla kits and product lines`,
  };
}

export default async function GradeDetail({ params }: GradeDetailPageProps) {
  const grade = await getGradeBySlug(params.slug);

  if (!grade) {
    notFound();
  }

  // Get some recent kits for this grade
  const recentKits = await getGradeKits(grade.id, 12, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:bg-primary-foreground/20">
              <Link href="/grades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grades
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2">{grade.name}</h1>
          {grade.description && (
            <p className="text-lg opacity-90 max-w-3xl">{grade.description}</p>
          )}
          <div className="mt-4 flex gap-6 text-sm opacity-75">
            <span>{grade.kitsCount} kits</span>
            <span>{grade.productLinesCount} product lines</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Product Lines Section */}
        {grade.productLines.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Product Lines</h2>
              <p className="text-muted-foreground">
                Explore the different product lines within {grade.name}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grade.productLines.map((productLine) => (
                <ProductLineCard key={productLine.id} productLine={productLine} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Kits Section */}
        {recentKits.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Recent {grade.name} Kits</h2>
              <p className="text-muted-foreground">
                Latest kits released in {grade.name} grade
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {recentKits.map((kit) => (
                <KitCard key={kit.id} kit={kit} />
              ))}
            </div>
            {grade.kitsCount > recentKits.length && (
              <div className="mt-8 text-center">
                <Button variant="outline" asChild>
                  <Link href={`/kits?grade=${grade.slug}`}>
                    View All {grade.kitsCount} {grade.name} Kits
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {grade.productLines.length === 0 && recentKits.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No content found for {grade.name}</p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for {grade.name} content.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
