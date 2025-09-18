"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Zap } from "lucide-react";
import { KitCard } from "@/components/kit-card";
import { MobileSuitCard } from "@/components/mobile-suit-card";

interface Kit {
  id: string;
  name: string;
  slug?: string | null;
  number: string;
  variant?: string | null;
  releaseDate?: Date | null;
  priceYen?: number | null;
  boxArt?: string | null;
  grade?: string | null;
  productLine?: string | null;
  series?: string | null;
  releaseType?: string | null;
  mobileSuits: string[];
}

interface MobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  kitsCount: number;
  scrapedImages: string[];
}

interface SearchResultsProps {
  results: {
    kits: Kit[];
    mobileSuits: MobileSuit[];
    totalKits: number;
    totalMobileSuits: number;
    hasMore: boolean;
  };
  query: string;
}

const PREVIEW_LIMIT = 8;

export function SearchResults({ results, query }: SearchResultsProps) {
  const displayKits = results.kits.slice(0, PREVIEW_LIMIT);
  const displayMobileSuits = results.mobileSuits.slice(0, PREVIEW_LIMIT);
  const hasMoreKits = results.totalKits > PREVIEW_LIMIT;
  const hasMoreMobileSuits = results.totalMobileSuits > PREVIEW_LIMIT;

  return (
    <div className="space-y-8">
      {/* Kits Section */}
      {results.kits.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Kits</h2>
              <Badge variant="secondary" className="text-sm">
                {results.totalKits} found
              </Badge>
            </div>
            {hasMoreKits && (
              <Button variant="outline" asChild>
                <Link href={`/kits?search=${encodeURIComponent(query)}`}>
                  View all kits
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayKits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Suits Section */}
      {results.mobileSuits.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Mobile Suits</h2>
              <Badge variant="secondary" className="text-sm">
                {results.totalMobileSuits} found
              </Badge>
            </div>
            {hasMoreMobileSuits && (
              <Button variant="outline" asChild>
                <Link href={`/mobile-suits?search=${encodeURIComponent(query)}`}>
                  View all mobile suits
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayMobileSuits.map((mobileSuit) => (
              <MobileSuitCard
                key={mobileSuit.id}
                mobileSuit={mobileSuit}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
