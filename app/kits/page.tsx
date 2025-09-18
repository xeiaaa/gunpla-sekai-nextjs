"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter, X, RotateCcw, Search } from "lucide-react";
import { FilterSection } from "@/components/filter-section";
import { KitCard } from "@/components/kit-card";
import { getFilterDataWithMeilisearch, getFilteredKitsWithMeilisearch } from "@/lib/actions/meilisearch-kits";

interface Kit {
  id: string;
  name: string;
  slug?: string | null;
  number: string;
  variant?: string | null;
  releaseDate?: Date | null;
  priceYen?: number | null;
  boxArt?: string | null;
  baseKitId?: string | null;
  grade?: string | null;
  productLine?: string | null;
  series?: string | null;
  releaseType?: string | null;
  mobileSuits: string[];
}

interface FilterData {
  grades: Array<{ id: string; name: string; slug: string | null }>;
  productLines: Array<{ id: string; name: string; slug: string | null }>;
  mobileSuits: Array<{ id: string; name: string; slug: string | null }>;
  series: Array<{ id: string; name: string; slug: string | null }>;
  releaseTypes: Array<{ id: string; name: string; slug: string | null }>;
}

function KitsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [kits, setKits] = useState<Kit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterData, setFilterData] = useState<FilterData>({
    grades: [],
    productLines: [],
    mobileSuits: [],
    series: [],
    releaseTypes: [],
  });

  // Applied filters (what's currently filtering the results)
  const [appliedGrades, setAppliedGrades] = useState<string[]>([]);
  const [appliedProductLines, setAppliedProductLines] = useState<string[]>([]);
  const [appliedMobileSuits, setAppliedMobileSuits] = useState<string[]>([]);
  const [appliedSeries, setAppliedSeries] = useState<string[]>([]);
  const [appliedReleaseTypes, setAppliedReleaseTypes] = useState<string[]>([]);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");

  // Pending filters (what user has selected but not yet applied)
  const [pendingGrades, setPendingGrades] = useState<string[]>([]);
  const [pendingProductLines, setPendingProductLines] = useState<string[]>([]);
  const [pendingMobileSuits, setPendingMobileSuits] = useState<string[]>([]);
  const [pendingSeries, setPendingSeries] = useState<string[]>([]);
  const [pendingReleaseTypes, setPendingReleaseTypes] = useState<string[]>([]);
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

  const [appliedSortBy, setAppliedSortBy] = useState("relevance");
  const [appliedOrder, setAppliedOrder] = useState("most-relevant");
  const [pendingSortBy, setPendingSortBy] = useState("relevance");
  const [pendingOrder, setPendingOrder] = useState("most-relevant");
  const [kitCollectionStatuses, setKitCollectionStatuses] = useState<Map<string, string>>(new Map());

  const loadKits = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getFilteredKitsWithMeilisearch({
        gradeIds: appliedGrades,
        productLineIds: appliedProductLines,
        mobileSuitIds: appliedMobileSuits,
        seriesIds: appliedSeries,
        releaseTypeIds: appliedReleaseTypes,
        searchTerm: appliedSearchTerm,
        sortBy: appliedSortBy,
        order: appliedOrder,
        limit: 50,
        offset: 0,
      });
      setKits(result.kits);
    } catch (error) {
      console.error('Error loading kits:', error);
      setKits([]);
    } finally {
      setLoading(false);
    }
  }, [appliedGrades, appliedProductLines, appliedMobileSuits, appliedSeries, appliedReleaseTypes, appliedSearchTerm, appliedSortBy, appliedOrder]);


  // Initialize from URL parameters
  useEffect(() => {
    // Only run if filterData is loaded (check if we have any filter data at all)
    const hasFilterData = filterData.grades.length > 0 || filterData.productLines.length > 0 ||
                         filterData.mobileSuits.length > 0 || filterData.series.length > 0 ||
                         filterData.releaseTypes.length > 0;

    if (!hasFilterData) {
      return;
    }

    const gradeSlugs = searchParams.get('grades')?.split(',').filter(Boolean) || [];
    const productLineSlugs = searchParams.get('productLines')?.split(',').filter(Boolean) || [];
    const mobileSuitSlugs = searchParams.get('mobileSuits')?.split(',').filter(Boolean) || [];
    const seriesSlugs = searchParams.get('series')?.split(',').filter(Boolean) || [];
    const releaseTypeSlugs = searchParams.get('releaseTypes')?.split(',').filter(Boolean) || [];
    const searchTerm = searchParams.get('search') || '';
    const sortByParam = searchParams.get('sortBy') || 'relevance';
    const orderParam = searchParams.get('order') || 'most-relevant';

    // Convert slugs to IDs using filter data
    const gradeIds = gradeSlugs.map(slug =>
      filterData.grades.find(grade => grade.slug === slug)?.id
    ).filter(Boolean) as string[];

    const productLineIds = productLineSlugs.map(slug =>
      filterData.productLines.find(pl => pl.slug === slug)?.id
    ).filter(Boolean) as string[];

    const mobileSuitIds = mobileSuitSlugs.map(slug =>
      filterData.mobileSuits.find(ms => ms.slug === slug)?.id
    ).filter(Boolean) as string[];

    const seriesIds = seriesSlugs.map(slug =>
      filterData.series.find(s => s.slug === slug)?.id
    ).filter(Boolean) as string[];

    const releaseTypeIds = releaseTypeSlugs.map(slug =>
      filterData.releaseTypes.find(rt => rt.slug === slug)?.id
    ).filter(Boolean) as string[];

    setAppliedGrades(gradeIds);
    setAppliedProductLines(productLineIds);
    setAppliedMobileSuits(mobileSuitIds);
    setAppliedSeries(seriesIds);
    setAppliedReleaseTypes(releaseTypeIds);
    setAppliedSearchTerm(searchTerm);
    setAppliedSortBy(sortByParam);
    setAppliedOrder(orderParam);
    setPendingGrades(gradeIds);
    setPendingProductLines(productLineIds);
    setPendingMobileSuits(mobileSuitIds);
    setPendingSeries(seriesIds);
    setPendingReleaseTypes(releaseTypeIds);
    setPendingSearchTerm(searchTerm);
    setPendingSortBy(sortByParam);
    setPendingOrder(orderParam);
  }, [searchParams, filterData]);

  useEffect(() => {
    const loadFilterData = async () => {
      const data = await getFilterDataWithMeilisearch();
      setFilterData(data);
    };
    loadFilterData();
  }, []);

  useEffect(() => {
    // Load kits when component mounts or when applied filters change
    loadKits();
  }, [loadKits]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const updateUrlParams = (filters: {
    grades?: string[];
    productLines?: string[];
    mobileSuits?: string[];
    series?: string[];
    releaseTypes?: string[];
    search?: string;
    sortBy?: string;
    order?: string;
  }) => {
    const params = new URLSearchParams();

    if (filters.grades && filters.grades.length > 0) {
      const gradeSlugs = filters.grades.map(id =>
        filterData.grades.find(grade => grade.id === id)?.slug
      ).filter(Boolean);
      if (gradeSlugs.length > 0) {
        params.set('grades', gradeSlugs.join(','));
      }
    }
    if (filters.productLines && filters.productLines.length > 0) {
      const productLineSlugs = filters.productLines.map(id =>
        filterData.productLines.find(pl => pl.id === id)?.slug
      ).filter(Boolean);
      if (productLineSlugs.length > 0) {
        params.set('productLines', productLineSlugs.join(','));
      }
    }
    if (filters.mobileSuits && filters.mobileSuits.length > 0) {
      const mobileSuitSlugs = filters.mobileSuits.map(id =>
        filterData.mobileSuits.find(ms => ms.id === id)?.slug
      ).filter(Boolean);
      if (mobileSuitSlugs.length > 0) {
        params.set('mobileSuits', mobileSuitSlugs.join(','));
      }
    }
    if (filters.series && filters.series.length > 0) {
      const seriesSlugs = filters.series.map(id =>
        filterData.series.find(s => s.id === id)?.slug
      ).filter(Boolean);
      if (seriesSlugs.length > 0) {
        params.set('series', seriesSlugs.join(','));
      }
    }
    if (filters.releaseTypes && filters.releaseTypes.length > 0) {
      const releaseTypeSlugs = filters.releaseTypes.map(id =>
        filterData.releaseTypes.find(rt => rt.id === id)?.slug
      ).filter(Boolean);
      if (releaseTypeSlugs.length > 0) {
        params.set('releaseTypes', releaseTypeSlugs.join(','));
      }
    }
    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.sortBy && filters.sortBy !== 'relevance') {
      params.set('sortBy', filters.sortBy);
    }
    if (filters.order && filters.order !== 'most-relevant') {
      params.set('order', filters.order);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/kits?${queryString}` : '/kits';
    router.push(newUrl);
  };

  const clearAllFilters = () => {
    setPendingGrades([]);
    setPendingProductLines([]);
    setPendingMobileSuits([]);
    setPendingSeries([]);
    setPendingReleaseTypes([]);
    setPendingSearchTerm("");
    setPendingSortBy("relevance");
    setPendingOrder("most-relevant");
  };

  const applyFilters = () => {
    // Apply pending filters to applied filters
    setAppliedGrades(pendingGrades);
    setAppliedProductLines(pendingProductLines);
    setAppliedMobileSuits(pendingMobileSuits);
    setAppliedSeries(pendingSeries);
    setAppliedReleaseTypes(pendingReleaseTypes);
    setAppliedSearchTerm(pendingSearchTerm);
    setAppliedSortBy(pendingSortBy);
    setAppliedOrder(pendingOrder);

    // Update URL parameters
    updateUrlParams({
      grades: pendingGrades,
      productLines: pendingProductLines,
      mobileSuits: pendingMobileSuits,
      series: pendingSeries,
      releaseTypes: pendingReleaseTypes,
      search: pendingSearchTerm,
      sortBy: pendingSortBy,
      order: pendingOrder,
    });

    setIsFilterOpen(false);
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Browse All Kits</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Button */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={toggleFilter}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Sidebar */}
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="flex-1 bg-black/50"
              onClick={() => setIsFilterOpen(false)}
            />

            {/* Filter Panel */}
            <div className="w-80 bg-card border-r shadow-lg flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Search Input */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Search</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search kits..."
                      value={pendingSearchTerm}
                      onChange={(e) => setPendingSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                {/* Sort Section - Compact */}
                <div className="mb-6">
                  <h3 className="font-medium mb-3">Sort</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={pendingSortBy}
                        onChange={(e) => setPendingSortBy(e.target.value)}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="name">Name</option>
                        <option value="release-date">Release Date</option>
                        <option value="rating">Rating</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={pendingOrder}
                        onChange={(e) => setPendingOrder(e.target.value)}
                        className="w-full p-2 text-sm border rounded-md bg-background"
                      >
                        <option value="most-relevant">Most Relevant</option>
                        <option value="least-relevant">Least Relevant</option>
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Filter Sections */}
                <div className="space-y-0">
                  <FilterSection
                    title="Grade"
                    options={filterData.grades}
                    selectedValues={pendingGrades}
                    onSelectionChange={setPendingGrades}
                    searchPlaceholder={`Search ${filterData.grades.length} grades...`}
                  />

                  <FilterSection
                    title="Product Line"
                    options={filterData.productLines}
                    selectedValues={pendingProductLines}
                    onSelectionChange={setPendingProductLines}
                    searchPlaceholder={`Search ${filterData.productLines.length} options...`}
                  />

                  <FilterSection
                    title="Mobile Suit"
                    options={filterData.mobileSuits}
                    selectedValues={pendingMobileSuits}
                    onSelectionChange={setPendingMobileSuits}
                    searchPlaceholder={`Search ${filterData.mobileSuits.length} options...`}
                  />

                  <FilterSection
                    title="Series"
                    options={filterData.series}
                    selectedValues={pendingSeries}
                    onSelectionChange={setPendingSeries}
                    searchPlaceholder={`Search ${filterData.series.length} options...`}
                  />

                  <FilterSection
                    title="Release Type"
                    options={filterData.releaseTypes}
                    selectedValues={pendingReleaseTypes}
                    onSelectionChange={setPendingReleaseTypes}
                    searchPlaceholder={`Search ${filterData.releaseTypes.length} options...`}
                  />
                </div>

              </div>

              {/* Fixed Action Buttons at Bottom */}
              <div className="border-t p-6 bg-card">
                <div className="space-y-2">
                  <Button onClick={applyFilters} className="w-full">
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="w-full flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Clear All
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kits Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading kits...</p>
            </div>
          </div>
        ) : kits.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground text-lg">No kits found</p>
              <p className="text-muted-foreground text-sm mt-2">
                Try adjusting your filters or clear all filters to see more results.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-stretch">
            {kits.map((kit) => (
              <KitCard
                key={kit.id}
                kit={kit}
                collectionStatus={kitCollectionStatuses.get(kit.id) as any}
                className="h-full"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KitsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="bg-primary text-primary-foreground py-4">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold">Browse All Kits</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <KitsPageContent />
    </Suspense>
  );
}
