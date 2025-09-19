"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAllSeries } from "@/lib/actions/kits";
import { Search, X } from "lucide-react";

interface Series {
  id: string;
  name: string;
  slug: string | null;
}

interface SeriesSelectionDialogProps {
  currentSeriesId?: string | null;
  currentSeriesName?: string | null;
  onSeriesSelect: (seriesId: string | null, seriesName: string | null) => void;
}

export function SeriesSelectionDialog({
  currentSeriesId,
  currentSeriesName,
  onSeriesSelect,
}: SeriesSelectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(currentSeriesId || null);
  const [selectedSeriesName, setSelectedSeriesName] = useState<string | null>(currentSeriesName || null);
  const [loading, setLoading] = useState(false);

  // Load series when dialog opens
  useEffect(() => {
    if (open && series.length === 0) {
      loadSeries();
    }
  }, [open, series.length]);

  // Filter series based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSeries(series);
    } else {
      const filtered = series.filter((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSeries(filtered);
    }
  }, [searchTerm, series]);

  const loadSeries = async () => {
    setLoading(true);
    try {
      const seriesData = await getAllSeries();
      setSeries(seriesData);
      setFilteredSeries(seriesData);
    } catch (error) {
      console.error("Error loading series:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const selectedSeries = series.find((s) => s.id === selectedSeriesId);
    const seriesName = selectedSeries?.name || null;
    setSelectedSeriesName(seriesName);
    onSeriesSelect(selectedSeriesId, seriesName);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedSeriesId(null);
    setSelectedSeriesName(null);
    onSeriesSelect(null, null);
    setOpen(false);
  };

  const handleCancel = () => {
    setSelectedSeriesId(currentSeriesId || null);
    setSelectedSeriesName(currentSeriesName || null);
    setSearchTerm("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selectedSeriesName ? selectedSeriesName : "Select Series"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Series</DialogTitle>
          <DialogDescription>
            Choose a series for this kit or clear the selection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          <div className="space-y-2">
            <Label htmlFor="search">Search Series</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <Label>Available Series</Label>
            <div className="flex-1 overflow-y-auto border rounded-md min-h-0">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading series...
                </div>
              ) : filteredSeries.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? "No series found matching your search." : "No series available."}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredSeries.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSeriesId(s.id)}
                      className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                        selectedSeriesId === s.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="font-medium">{s.name}</div>
                      {s.slug && (
                        <div className="text-sm text-muted-foreground">{s.slug}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="w-full sm:w-auto"
          >
            Clear Selection
          </Button>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1 sm:flex-none"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
