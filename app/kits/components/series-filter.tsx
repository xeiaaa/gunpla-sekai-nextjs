"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSeries } from "@/lib/actions/kits";
import { Plus, Search } from "lucide-react";
import SeriesForm from "./series-form";

interface Series {
  name: string;
  slug: string | null;
}

interface SeriesFilterProps {
  currentSeriesSlug?: string | null;
  currentSeriesName?: string | null;
  onSeriesSelect: (seriesId: string | null, seriesName: string | null) => void;
}

const LOCAL_STORAGE_KEY = "cachedSeries";

export function SeriesFilter({
  currentSeriesSlug,
  currentSeriesName,
  onSeriesSelect,
}: SeriesFilterProps) {
  const [open, setOpen] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [series, setSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string | null>(
    currentSeriesSlug || null
  );
  const [selectedSeriesName, setSelectedSeriesName] = useState<string | null>(
    currentSeriesName || null
  );

  const [isLoading, setIsLoading] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const TAKE = 20;

  // Load from localStorage first
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        const parsed: Series[] = JSON.parse(cached);
        setSeries(parsed);
      } catch {
        console.warn("Failed to parse cached series");
      }
    }
  }, []);

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (series.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(series));
    }
  }, [series]);

  // Fetch initial series or when search term changes
  useEffect(() => {
    const fetchSeries = async () => {
      setIsLoading(true);

      // Fetch server-side results
      const { series: serverSeries, totalCount } = await getSeries({
        search: searchTerm,
        skip: 0,
        take: TAKE,
      });

      // Get local cached ones (created locally)
      const localSeries: Series[] = JSON.parse(
        localStorage.getItem("series") || "[]"
      );

      // Filter local series by search term
      const matchingLocal = localSeries.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Merge, avoiding duplicates by id
      const merged = [...matchingLocal, ...serverSeries].filter(
        (s, index, self) => index === self.findIndex((x) => x.slug === s.slug)
      );

      setSeries(merged);
      setSkip(merged.length);
      setHasMore(merged.length < totalCount);
      setIsLoading(false);
    };

    if (open) fetchSeries();
  }, [open, searchTerm]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(async (entries) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setIsLoading(true);
        const { series: newSeries, totalCount } = await getSeries({
          search: searchTerm,
          skip,
          take: TAKE,
        });

        setSeries((prev) => {
          const existingIds = new Set(prev.map((s) => s.slug));
          const merged = [
            ...prev,
            ...newSeries.filter((s) => !existingIds.has(s.slug)),
          ];
          return merged.sort((a, b) => a.name.localeCompare(b.name));
        });

        setSkip((prev) => prev + newSeries.length);
        setHasMore(skip + newSeries.length < totalCount);
        setIsLoading(false);
      }
    });

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [skip, hasMore, isLoading, searchTerm]);

  const handleSubmit = () => {
    const selected = series.find((s) => s.slug === selectedSeriesSlug);
    onSeriesSelect(selected?.slug || null, selected?.name || null);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedSeriesSlug(null);
    setSelectedSeriesName(null);
    onSeriesSelect(null, null);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedSeriesSlug(currentSeriesSlug || null);
    setSelectedSeriesName(currentSeriesName || null);
    setSearchTerm("");
    setOpen(false);
  };

  const handleNewSeriesAdded = (newSeries: Series) => {
    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("series") || "[]");
    const updated = [newSeries, ...existing];
    localStorage.setItem("series", JSON.stringify(updated));

    // Update UI immediately
    setSeries((prev) => [newSeries, ...prev]);
    setSelectedSeriesSlug(newSeries.slug);
    setSelectedSeriesName(newSeries.name);
    setOpenForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center cursor-pointer">
          {selectedSeriesName ? selectedSeriesName : "Select Series"}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select or Create Series</DialogTitle>
          <DialogDescription>
            Choose a series or create a new one below.
          </DialogDescription>
        </DialogHeader>

        {/* Search + Add New */}
        <div className="flex gap-2 items-center mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Dialog
            open={openForm}
            onOpenChange={(open) => {
              setOpenForm(open);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-2">
              <DialogHeader>
                <DialogTitle>Add new series</DialogTitle>
              </DialogHeader>
              <SeriesForm onSuccess={handleNewSeriesAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        <div className="border rounded-md flex-1 overflow-y-auto divide-y">
          {isLoading && series.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading series...
            </div>
          ) : series.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No series found.
            </div>
          ) : (
            series.map((s) => (
              <button
                key={s.slug}
                onClick={() => {
                  setSelectedSeriesSlug(s.slug);
                  setSelectedSeriesName(s.name);
                }}
                className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                  selectedSeriesSlug === s.slug ? "bg-muted" : ""
                }`}
              >
                <div className="font-medium">{s.name}</div>
                {s.slug && (
                  <div className="text-sm text-muted-foreground">{s.slug}</div>
                )}
              </button>
            ))
          )}

          <div
            ref={observerRef}
            className="h-10 flex justify-center items-center text-muted-foreground text-sm"
          >
            {isLoading && series.length > 0 && "Loading more..."}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button type="button" variant="outline" onClick={handleClear}>
            Clear Selection
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit}>
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
