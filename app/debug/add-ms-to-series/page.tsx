"use client";

import { useState, useEffect } from "react";
import { getAllMobileSuits, updateMobileSuitSeries } from "@/lib/actions/mobile-suits";
import { getAllSeries } from "@/lib/actions/series";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  series: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  kitsCount: number;
  scrapedImages: string[];
}

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

export default function AddMobileSuitsToSeriesPage() {
  const [mobileSuits, setMobileSuits] = useState<MobileSuit[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedMobileSuits, setSelectedMobileSuits] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mobileSuitsData, seriesData] = await Promise.all([
          getAllMobileSuits(),
          getAllSeries(),
        ]);
        setMobileSuits(mobileSuitsData);
        setSeries(seriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMobileSuitToggle = (mobileSuitId: string) => {
    setSelectedMobileSuits(prev =>
      prev.includes(mobileSuitId)
        ? prev.filter(id => id !== mobileSuitId)
        : [...prev, mobileSuitId]
    );
  };

  // Filter mobile suits based on search term
  const filteredMobileSuits = mobileSuits.filter(ms =>
    ms.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ms.series?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (ms.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleSelectAll = () => {
    if (selectedMobileSuits.length === filteredMobileSuits.length) {
      setSelectedMobileSuits([]);
    } else {
      setSelectedMobileSuits(filteredMobileSuits.map(ms => ms.id));
    }
  };

  const handleUpdateSeries = async () => {
    if (selectedMobileSuits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one mobile suit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const seriesId = selectedSeries === "" ? null : selectedSeries;
      const result = await updateMobileSuitSeries(selectedMobileSuits, seriesId);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully updated ${result.updatedCount} mobile suits`
        });

        // Refresh the mobile suits data
        const updatedMobileSuits = await getAllMobileSuits();
        setMobileSuits(updatedMobileSuits);
        setSelectedMobileSuits([]);
        setSelectedSeries("");
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update mobile suits' });
      }
    } catch (error) {
      console.error('Error updating mobile suits:', error);
      setMessage({ type: 'error', text: 'Failed to update mobile suits' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromSeries = async () => {
    if (selectedMobileSuits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one mobile suit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateMobileSuitSeries(selectedMobileSuits, null);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully removed ${result.updatedCount} mobile suits from series`
        });

        // Refresh the mobile suits data
        const updatedMobileSuits = await getAllMobileSuits();
        setMobileSuits(updatedMobileSuits);
        setSelectedMobileSuits([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove mobile suits from series' });
      }
    } catch (error) {
      console.error('Error removing mobile suits from series:', error);
      setMessage({ type: 'error', text: 'Failed to remove mobile suits from series' });
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
        <h1 className="text-3xl font-bold">Add Mobile Suits to Series</h1>
        <p className="text-muted-foreground mt-2">
          Select multiple mobile suits and assign them to a series, or remove them from their current series.
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
        {/* Mobile Suits Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Mobile Suits</CardTitle>
            <CardDescription>
              Choose which mobile suits to assign to a series
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="search-mobile-suits" className="block text-sm font-medium mb-2">
                Search Mobile Suits
              </label>
              <input
                id="search-mobile-suits"
                type="text"
                placeholder="Search by name, series, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedMobileSuits.length} of {filteredMobileSuits.length} selected
                {searchTerm && ` (${mobileSuits.length} total)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredMobileSuits.length === 0}
              >
                {selectedMobileSuits.length === filteredMobileSuits.length && filteredMobileSuits.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredMobileSuits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No mobile suits found matching your search.' : 'No mobile suits available.'}
                </div>
              ) : (
                filteredMobileSuits.map((ms) => (
                <div
                  key={ms.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMobileSuits.includes(ms.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleMobileSuitToggle(ms.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{ms.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ms.series ? `Series: ${ms.series.name}` : 'No series assigned'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ms.kitsCount} kits
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedMobileSuits.includes(ms.id)}
                      onChange={() => handleMobileSuitToggle(ms.id)}
                      className="ml-2"
                    />
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Series Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign to Series</CardTitle>
            <CardDescription>
              Choose a series to assign the selected mobile suits to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="series-select" className="block text-sm font-medium mb-2">
                Select Series
              </label>
              <select
                id="series-select"
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">No series (remove from current)</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.mobileSuitsCount} mobile suits)
                    {s.timeline && ` - ${s.timeline.name}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleUpdateSeries}
                disabled={updating || selectedMobileSuits.length === 0}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Assign to Series'}
              </Button>

              <Button
                variant="outline"
                onClick={handleRemoveFromSeries}
                disabled={updating || selectedMobileSuits.length === 0}
                className="w-full"
              >
                {updating ? 'Removing...' : 'Remove from Series'}
              </Button>
            </div>

            {selectedMobileSuits.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Mobile Suits:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedMobileSuits.map(mobileSuitId => {
                    const ms = mobileSuits.find(mobileSuit => mobileSuit.id === mobileSuitId);
                    return ms ? (
                      <li key={mobileSuitId}>• {ms.name}</li>
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
