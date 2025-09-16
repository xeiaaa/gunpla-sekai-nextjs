"use client";

import { useState, useEffect } from "react";
import { getAllSeries, updateSeriesTimeline } from "@/lib/actions/series";
import { getAllTimelines } from "@/lib/actions/timelines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Series {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  timeline: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  mobileSuitsCount: number;
  kitsCount: number;
  scrapedImages: string[];
}

interface Timeline {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  seriesCount: number;
}

export default function AddSeriesToTimelinesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [seriesData, timelinesData] = await Promise.all([
          getAllSeries(),
          getAllTimelines(),
        ]);
        setSeries(seriesData);
        setTimelines(timelinesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSeriesToggle = (seriesId: string) => {
    setSelectedSeries(prev =>
      prev.includes(seriesId)
        ? prev.filter(id => id !== seriesId)
        : [...prev, seriesId]
    );
  };

  // Filter series based on search term
  const filteredSeries = series.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.timeline?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (s.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSelectAll = () => {
    if (selectedSeries.length === filteredSeries.length) {
      setSelectedSeries([]);
    } else {
      setSelectedSeries(filteredSeries.map(s => s.id));
    }
  };

  const handleUpdateTimeline = async () => {
    if (selectedSeries.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one series' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const timelineId = selectedTimeline === "" ? null : selectedTimeline;
      const result = await updateSeriesTimeline(selectedSeries, timelineId);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully updated ${result.updatedCount} series`
        });

        // Refresh the series data
        const updatedSeries = await getAllSeries();
        setSeries(updatedSeries);
        setSelectedSeries([]);
        setSelectedTimeline("");
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update series' });
      }
    } catch (error) {
      console.error('Error updating series:', error);
      setMessage({ type: 'error', text: 'Failed to update series' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromTimeline = async () => {
    if (selectedSeries.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one series' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateSeriesTimeline(selectedSeries, null);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully removed ${result.updatedCount} series from timeline`
        });

        // Refresh the series data
        const updatedSeries = await getAllSeries();
        setSeries(updatedSeries);
        setSelectedSeries([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove series from timeline' });
      }
    } catch (error) {
      console.error('Error removing series from timeline:', error);
      setMessage({ type: 'error', text: 'Failed to remove series from timeline' });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Series to Timelines</h1>
        <p className="text-muted-foreground mt-2">
          Select multiple series and assign them to a timeline, or remove them from their current timeline.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Series Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Series</CardTitle>
            <CardDescription>
              Choose which series to assign to a timeline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="search-series" className="block text-sm font-medium mb-2">
                Search Series
              </label>
              <input
                id="search-series"
                type="text"
                placeholder="Search by name, timeline, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedSeries.length} of {filteredSeries.length} selected
                {searchTerm && ` (${series.length} total)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredSeries.length === 0}
              >
                {selectedSeries.length === filteredSeries.length && filteredSeries.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredSeries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No series found matching your search.' : 'No series available.'}
                </div>
              ) : (
                filteredSeries.map((s) => (
                <div
                  key={s.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSeries.includes(s.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSeriesToggle(s.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{s.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {s.timeline ? `Timeline: ${s.timeline.name}` : 'No timeline assigned'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {s.mobileSuitsCount} mobile suits, {s.kitsCount} kits
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedSeries.includes(s.id)}
                      onChange={() => handleSeriesToggle(s.id)}
                      className="ml-2"
                    />
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign to Timeline</CardTitle>
            <CardDescription>
              Choose a timeline to assign the selected series to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="timeline-select" className="block text-sm font-medium mb-2">
                Select Timeline
              </label>
              <select
                id="timeline-select"
                value={selectedTimeline}
                onChange={(e) => setSelectedTimeline(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">No timeline (remove from current)</option>
                {timelines.map((timeline) => (
                  <option key={timeline.id} value={timeline.id}>
                    {timeline.name} ({timeline.seriesCount} series)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleUpdateTimeline}
                disabled={updating || selectedSeries.length === 0}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Assign to Timeline'}
              </Button>

              <Button
                variant="outline"
                onClick={handleRemoveFromTimeline}
                disabled={updating || selectedSeries.length === 0}
                className="w-full"
              >
                {updating ? 'Removing...' : 'Remove from Timeline'}
              </Button>
            </div>

            {selectedSeries.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Series:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedSeries.map(seriesId => {
                    const s = series.find(series => series.id === seriesId);
                    return s ? (
                      <li key={seriesId}>• {s.name}</li>
                    ) : null;
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
