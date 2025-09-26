import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getProductLineBySlug,
  getProductLineKits,
} from "@/lib/actions/product-lines";
import { KitCard } from "@/components/kit-card";

interface ProductLineDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductLineDetailPageProps) {
  const { slug } = await params;
  const productLine = await getProductLineBySlug(slug);

  if (!productLine) {
    return {
      title: "Product Line Not Found - Gunpla Sekai",
    };
  }

  return {
    title: `${productLine.name} - Gunpla Sekai`,
    description:
      productLine.description ||
      `Explore ${productLine.name} product line kits`,
  };
}

export default async function ProductLineDetail({
  params,
}: ProductLineDetailPageProps) {
  const { slug } = await params;
  const productLine = await getProductLineBySlug(slug);

  if (!productLine) {
    notFound();
  }

  // Get some recent kits for this product line
  const recentKits = await getProductLineKits(productLine.id, 20, 0);

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
              <Link href={`/grades/${productLine.grade.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to {productLine.grade.name}
              </Link>
            </Button>
          </div>
          <div className="flex items-start gap-6">
            {/* Product Line Logo/Image */}
            {(productLine.logo || productLine.scrapedImage) && (
              <div className="flex-shrink-0">
                <div className="w-24 h-24 relative">
                  <Image
                    src={
                      productLine.logo?.url || productLine.scrapedImage || ""
                    }
                    alt={`${productLine.name} logo`}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{productLine.name}</h1>
              <div className="text-sm opacity-75 mb-2">
                {productLine.grade.name} Product Line
              </div>
              {productLine.description && (
                <p className="text-lg opacity-90 max-w-3xl">
                  {productLine.description}
                </p>
              )}
              <div className="mt-4 text-sm opacity-75">
                {productLine.kitsCount} kits
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {recentKits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">
                No kits found in {productLine.name}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Check back later for {productLine.name} content.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">
                {productLine.name} Kits
              </h2>
              <p className="text-muted-foreground">
                All kits in the {productLine.name} product line
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
