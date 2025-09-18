"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getSearchSuggestions } from "@/lib/actions/search";

interface SearchSuggestionsProps {
  query: string;
}

// Mock suggestion data - replace with actual API
const SUGGESTION_KEYWORDS = [
  "gundam", "wing", "freedom", "strike", "unicorn", "barbatos",
  "rx-78", "zaku", "char", "amuro", "heero", "kira", "setsuna"
];

const POPULAR_SEARCHES = [
  "RX-78-2 Gundam",
  "Wing Gundam",
  "Freedom Gundam",
  "Strike Gundam",
  "Unicorn Gundam",
  "Barbatos Gundam",
  "Zaku II",
  "Char's Zaku"
];

export function SearchSuggestions({ query }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (query.length > 1) {
      // Get real suggestions from database
      getSearchSuggestions(query).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  if (suggestions.length === 0 && query.length <= 1) {
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {POPULAR_SEARCHES.map((search) => (
            <Button
              key={search}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(search)}
              className="text-sm"
            >
              {search}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Did you mean?</h3>
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion) => (
          <Badge
            key={suggestion}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </Badge>
        ))}
      </div>
    </div>
  );
}
