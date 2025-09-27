"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KitImage } from "@/components/kit-image";
import { Loader2, Plus, Search, X, Tag, Calendar } from "lucide-react";
import { createBuild } from "@/lib/actions/builds";
import { useKits } from "@/hooks/use-kits";

interface Kit {
  id: string;
  name: string;
  slug: string;
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

interface KitSearchResultsProps {
  searchTerm: string;
  onKitSelect: (kit: Kit) => void;
  selectedKit?: Kit | null;
}

function KitSearchResults({
  searchTerm,
  onKitSelect,
  selectedKit,
}: KitSearchResultsProps) {
  const { data: searchResults, isLoading: searchLoading } = useKits({
    gradeIds: [],
    productLineIds: [],
    mobileSuitIds: [],
    seriesIds: [],
    releaseTypeIds: [],
    searchTerm,
    sortBy: "relevance",
    order: "most-relevant",
    limit: 10,
    offset: 0,
    includeExpansions: true,
    includeVariants: true,
  });

  const kits = useMemo(() => searchResults?.kits || [], [searchResults]);

  if (!searchTerm.trim()) {
    return null;
  }

  if (searchLoading) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1">
        <div className="p-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">
            Searching kits...
          </span>
        </div>
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1">
        <div className="p-4 text-center text-sm text-muted-foreground">
          No kits found for &quot;{searchTerm}&quot;
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 bg-background border border-border rounded-md shadow-lg mt-1 max-h-96 overflow-y-auto">
      <div className="p-2">
        {kits.map((kit) => (
          <button
            key={kit.id}
            onClick={() => onKitSelect(kit)}
            className={`w-full text-left p-3 rounded-md transition-colors hover:bg-muted ${
              selectedKit?.id === kit.id ? "bg-muted border border-primary" : ""
            }`}
          >
            <div className="flex gap-3">
              <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden">
                <KitImage
                  src={kit.boxArt || ""}
                  alt={kit.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{kit.name}</h4>
                  <Badge variant="secondary" className="text-xs">
                    #{kit.number}
                  </Badge>
                </div>
                {kit.variant && (
                  <p className="text-xs text-muted-foreground mb-1">
                    {kit.variant}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {kit.grade && (
                    <Badge variant="outline" className="text-xs">
                      {kit.grade}
                    </Badge>
                  )}
                  {kit.productLine && (
                    <Badge variant="outline" className="text-xs">
                      {kit.productLine}
                    </Badge>
                  )}
                  {kit.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(kit.releaseDate).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NewBuildPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Build form state
  const [buildTitle, setBuildTitle] = useState("");
  const [buildDescription, setBuildDescription] = useState("");
  const [buildStatus, setBuildStatus] = useState<
    "PLANNING" | "IN_PROGRESS" | "COMPLETED"
  >("PLANNING");
  const [loading, setLoading] = useState(false);

  // Kit search state
  const [kitSearchTerm, setKitSearchTerm] = useState("");
  const [selectedKit, setSelectedKit] = useState<Kit | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Prefill kit from URL params if coming from /kits/[slug]
  useEffect(() => {
    const kitId = searchParams.get("kitId");
    const kitName = searchParams.get("kitName");
    const kitSlug = searchParams.get("kitSlug");
    const kitNumber = searchParams.get("kitNumber");
    const kitBoxArt = searchParams.get("kitBoxArt");
    const kitGrade = searchParams.get("kitGrade");
    const kitProductLine = searchParams.get("kitProductLine");
    const kitSeries = searchParams.get("kitSeries");

    if (kitId && kitName) {
      const prefilledKit: Kit = {
        id: kitId,
        name: kitName,
        slug: kitSlug || "",
        number: kitNumber || "",
        boxArt: kitBoxArt || null,
        grade: kitGrade || null,
        productLine: kitProductLine || null,
        series: kitSeries || null,
        mobileSuits: [],
      };
      setSelectedKit(prefilledKit);
      setKitSearchTerm(kitName);
    }
  }, [searchParams]);

  const handleKitSelect = useCallback((kit: Kit) => {
    setSelectedKit(kit);
    setKitSearchTerm(kit.name);
    setShowSearchResults(false);
  }, []);

  const handleClearKit = useCallback(() => {
    setSelectedKit(null);
    setKitSearchTerm("");
    setShowSearchResults(false);
  }, []);

  const handleCreateBuild = async () => {
    if (!buildTitle.trim()) {
      alert("Please enter a build title");
      return;
    }

    if (!selectedKit) {
      alert("Please select a kit for this build");
      return;
    }

    setLoading(true);
    try {
      const build = await createBuild({
        kitId: selectedKit.id,
        title: buildTitle,
        description: buildDescription || undefined,
        status: buildStatus,
      });

      console.log("Build created successfully:", build);

      // Redirect to build edit page
      router.push(`/builds/${build.id}/edit`);
    } catch (error) {
      console.error("Error creating build:", error);
      alert("Failed to create build. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatReleaseDate = (date: Date | null | undefined) => {
    if (!date) return "TBA";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Start a New Build</h1>
          <p className="text-primary-foreground/80 mt-1">
            Create a new build and start tracking your progress
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Build Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Kit Selection */}
            <div className="space-y-4">
              <Label htmlFor="kit-search">Select Kit *</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="kit-search"
                    value={kitSearchTerm}
                    onChange={(e) => {
                      setKitSearchTerm(e.target.value);
                      setShowSearchResults(true);
                      if (!e.target.value.trim()) {
                        setSelectedKit(null);
                      }
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    onBlur={() => {
                      // Delay hiding to allow click on results
                      setTimeout(() => setShowSearchResults(false), 200);
                    }}
                    placeholder="Search for a kit by name or number..."
                    className="pl-10"
                  />
                </div>

                {showSearchResults && (
                  <KitSearchResults
                    searchTerm={kitSearchTerm}
                    onKitSelect={handleKitSelect}
                    selectedKit={selectedKit}
                  />
                )}
              </div>

              {/* Selected Kit Display */}
              {selectedKit && (
                <div className="border border-border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Selected Kit</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearKit}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                      <KitImage
                        src={selectedKit.boxArt || ""}
                        alt={selectedKit.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{selectedKit.name}</h4>
                        <Badge variant="secondary">#{selectedKit.number}</Badge>
                      </div>
                      {selectedKit.variant && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedKit.variant}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {selectedKit.grade && (
                          <Badge variant="outline" className="text-xs">
                            {selectedKit.grade}
                          </Badge>
                        )}
                        {selectedKit.productLine && (
                          <Badge variant="outline" className="text-xs">
                            {selectedKit.productLine}
                          </Badge>
                        )}
                        {selectedKit.series && (
                          <Badge variant="outline" className="text-xs">
                            {selectedKit.series}
                          </Badge>
                        )}
                        {selectedKit.releaseDate && (
                          <Badge variant="outline" className="text-xs">
                            {formatReleaseDate(selectedKit.releaseDate)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Build Title */}
            <div>
              <Label htmlFor="build-title">Build Title *</Label>
              <Input
                id="build-title"
                value={buildTitle}
                onChange={(e) => setBuildTitle(e.target.value)}
                placeholder="e.g., My First RG Build"
                required
              />
            </div>

            {/* Build Description */}
            <div>
              <Label htmlFor="build-description">Description</Label>
              <MarkdownEditor
                value={buildDescription}
                onChange={setBuildDescription}
                placeholder="Tell us about your build plans... (Markdown supported)"
                height={150}
              />
            </div>

            {/* Initial Status */}
            <div>
              <Label htmlFor="build-status">Initial Status</Label>
              <Select
                value={buildStatus}
                onValueChange={(
                  value: "PLANNING" | "IN_PROGRESS" | "COMPLETED"
                ) => setBuildStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateBuild}
              disabled={loading || !buildTitle.trim() || !selectedKit}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Build...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Build
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NewBuildPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      }
    >
      <NewBuildPageContent />
    </Suspense>
  );
}
