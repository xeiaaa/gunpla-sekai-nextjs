"use client";

import { Search, Package, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>

      <h2 className="text-2xl font-bold mb-4">
        No results found for "{query}"
      </h2>

      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find any kits or mobile suits matching your search.
        Try different keywords or check the suggestions below.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" asChild>
          <a href="/kits">
            <Package className="h-4 w-4 mr-2" />
            Browse All Kits
          </a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/mobile-suits">
            <Zap className="h-4 w-4 mr-2" />
            Browse All Mobile Suits
          </a>
        </Button>
      </div>
    </div>
  );
}
