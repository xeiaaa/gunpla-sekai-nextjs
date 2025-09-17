"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAllKits, addKitToMobileSuits, removeKitFromMobileSuits } from "@/lib/actions/kits";
import { getAllMobileSuits } from "@/lib/actions/mobile-suits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Kit {
  id: string;
  name: string;
  slug: string | null;
  number: string;
  variant: string | null;
  releaseDate: Date | null;
  priceYen: number | null;
  boxArt: string | null;
  scrapedImages: string[];
  grade: string | null;
  productLine: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  series: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  mobileSuitsCount: number;
  mobileSuits: string[];
}

interface MobileSuit {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  scrapedImages: string[];
  series: {
    id: string;
    name: string;
    slug: string | null;
  } | null;
  kitsCount: number;
}

export default function AddKitsToMobileSuitsPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [mobileSuits, setMobileSuits] = useState<MobileSuit[]>([]);
  const [selectedKits, setSelectedKits] = useState<string[]>([]);
  const [selectedMobileSuits, setSelectedMobileSuits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [kitSearchTerm, setKitSearchTerm] = useState("");
  const [mobileSuitSearchTerm, setMobileSuitSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kitsData, mobileSuitsData] = await Promise.all([
          getAllKits(),
          getAllMobileSuits(),
        ]);
        setKits(kitsData);
        setMobileSuits(mobileSuitsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMessage({ type: 'error', text: 'Failed to load data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleKitToggle = (kitId: string) => {
    setSelectedKits(prev =>
      prev.includes(kitId)
        ? prev.filter(id => id !== kitId)
        : [...prev, kitId]
    );
  };

  const handleMobileSuitToggle = (mobileSuitId: string) => {
    setSelectedMobileSuits(prev =>
      prev.includes(mobileSuitId)
        ? prev.filter(id => id !== mobileSuitId)
        : [...prev, mobileSuitId]
    );
  };

  // Filter kits based on search term
  const filteredKits = kits.filter(kit =>
    kit.name.toLowerCase().includes(kitSearchTerm.toLowerCase()) ||
    kit.number.toLowerCase().includes(kitSearchTerm.toLowerCase()) ||
    (kit.productLine?.name.toLowerCase().includes(kitSearchTerm.toLowerCase()) ?? false) ||
    (kit.series?.name.toLowerCase().includes(kitSearchTerm.toLowerCase()) ?? false) ||
    (kit.grade?.toLowerCase().includes(kitSearchTerm.toLowerCase()) ?? false) ||
    kit.mobileSuits.some(ms => ms.toLowerCase().includes(kitSearchTerm.toLowerCase()))
  );

  // Filter mobile suits based on search term
  const filteredMobileSuits = mobileSuits.filter(ms =>
    ms.name.toLowerCase().includes(mobileSuitSearchTerm.toLowerCase()) ||
    (ms.description?.toLowerCase().includes(mobileSuitSearchTerm.toLowerCase()) ?? false) ||
    (ms.series?.name.toLowerCase().includes(mobileSuitSearchTerm.toLowerCase()) ?? false)
  );

  const handleSelectAllKits = () => {
    if (selectedKits.length === filteredKits.length) {
      setSelectedKits([]);
    } else {
      setSelectedKits(filteredKits.map(kit => kit.id));
    }
  };

  const handleSelectAllMobileSuits = () => {
    if (selectedMobileSuits.length === filteredMobileSuits.length) {
      setSelectedMobileSuits([]);
    } else {
      setSelectedMobileSuits(filteredMobileSuits.map(ms => ms.id));
    }
  };

  const handleAddRelationships = async () => {
    if (selectedKits.length === 0 || selectedMobileSuits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one kit and one mobile suit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await addKitToMobileSuits(selectedKits, selectedMobileSuits);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully created ${result.createdCount} kit-mobile suit relationships`
        });

        // Refresh the data
        const [updatedKits, updatedMobileSuits] = await Promise.all([
          getAllKits(),
          getAllMobileSuits(),
        ]);
        setKits(updatedKits);
        setMobileSuits(updatedMobileSuits);
        setSelectedKits([]);
        setSelectedMobileSuits([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add relationships' });
      }
    } catch (error) {
      console.error('Error adding relationships:', error);
      setMessage({ type: 'error', text: 'Failed to add relationships' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveRelationships = async () => {
    if (selectedKits.length === 0 || selectedMobileSuits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one kit and one mobile suit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await removeKitFromMobileSuits(selectedKits, selectedMobileSuits);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully removed ${result.deletedCount} kit-mobile suit relationships`
        });

        // Refresh the data
        const [updatedKits, updatedMobileSuits] = await Promise.all([
          getAllKits(),
          getAllMobileSuits(),
        ]);
        setKits(updatedKits);
        setMobileSuits(updatedMobileSuits);
        setSelectedKits([]);
        setSelectedMobileSuits([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove relationships' });
      }
    } catch (error) {
      console.error('Error removing relationships:', error);
      setMessage({ type: 'error', text: 'Failed to remove relationships' });
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
        <h1 className="text-3xl font-bold">Add Kits to Mobile Suits</h1>
        <p className="text-muted-foreground mt-2">
          Select kits and mobile suits to create many-to-many relationships between them.
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
        {/* Kits Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Kits</CardTitle>
            <CardDescription>
              Choose which kits to associate with mobile suits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="search-kits" className="block text-sm font-medium mb-2">
                Search Kits
              </label>
              <input
                id="search-kits"
                type="text"
                placeholder="Search by name, number, product line, series, grade, or mobile suit..."
                value={kitSearchTerm}
                onChange={(e) => setKitSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedKits.length} of {filteredKits.length} selected
                {kitSearchTerm && ` (${kits.length} total)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllKits}
                disabled={filteredKits.length === 0}
              >
                {selectedKits.length === filteredKits.length && filteredKits.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredKits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {kitSearchTerm ? 'No kits found matching your search.' : 'No kits available.'}
                </div>
              ) : (
                filteredKits.map((kit) => (
                <div
                  key={kit.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedKits.includes(kit.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleKitToggle(kit.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Box Art */}
                      {kit.boxArt && (
                        <div className="flex-shrink-0 relative w-16 h-16">
                          <Image
                            src={kit.boxArt}
                            alt={`${kit.name} box art`}
                            fill
                            className="object-cover rounded border"
                            sizes="64px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Kit Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{kit.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {kit.number} • {kit.grade}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {kit.productLine ? `Product Line: ${kit.productLine.name}` : 'No product line assigned'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {kit.mobileSuitsCount} mobile suit{kit.mobileSuitsCount !== 1 ? 's' : ''}
                          {kit.series && ` • ${kit.series.name}`}
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={selectedKits.includes(kit.id)}
                      onChange={() => handleKitToggle(kit.id)}
                      className="ml-2 flex-shrink-0"
                    />
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Suits Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Mobile Suits</CardTitle>
            <CardDescription>
              Choose which mobile suits to associate with the selected kits
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
                placeholder="Search by name, description, or series..."
                value={mobileSuitSearchTerm}
                onChange={(e) => setMobileSuitSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedMobileSuits.length} of {filteredMobileSuits.length} selected
                {mobileSuitSearchTerm && ` (${mobileSuits.length} total)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllMobileSuits}
                disabled={filteredMobileSuits.length === 0}
              >
                {selectedMobileSuits.length === filteredMobileSuits.length && filteredMobileSuits.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredMobileSuits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {mobileSuitSearchTerm ? 'No mobile suits found matching your search.' : 'No mobile suits available.'}
                </div>
              ) : (
                filteredMobileSuits.map((mobileSuit) => (
                <div
                  key={mobileSuit.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMobileSuits.includes(mobileSuit.id)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleMobileSuitToggle(mobileSuit.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Mobile Suit Image */}
                      {mobileSuit.scrapedImages.length > 0 && (
                        <div className="flex-shrink-0 relative w-16 h-16">
                          <Image
                            src={mobileSuit.scrapedImages[0]}
                            alt={`${mobileSuit.name} image`}
                            fill
                            className="object-cover rounded border"
                            sizes="64px"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Mobile Suit Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{mobileSuit.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {mobileSuit.kitsCount} kit{mobileSuit.kitsCount !== 1 ? 's' : ''}
                          {mobileSuit.series && ` • ${mobileSuit.series.name}`}
                        </p>
                        {mobileSuit.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {mobileSuit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={selectedMobileSuits.includes(mobileSuit.id)}
                      onChange={() => handleMobileSuitToggle(mobileSuit.id)}
                      className="ml-2 flex-shrink-0"
                    />
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Relationships</CardTitle>
          <CardDescription>
            Add or remove relationships between the selected kits and mobile suits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={handleAddRelationships}
              disabled={updating || selectedKits.length === 0 || selectedMobileSuits.length === 0}
              className="w-full"
            >
              {updating ? 'Adding...' : `Add ${selectedKits.length} kit${selectedKits.length !== 1 ? 's' : ''} to ${selectedMobileSuits.length} mobile suit${selectedMobileSuits.length !== 1 ? 's' : ''}`}
            </Button>

            <Button
              variant="outline"
              onClick={handleRemoveRelationships}
              disabled={updating || selectedKits.length === 0 || selectedMobileSuits.length === 0}
              className="w-full"
            >
              {updating ? 'Removing...' : `Remove relationships between ${selectedKits.length} kit${selectedKits.length !== 1 ? 's' : ''} and ${selectedMobileSuits.length} mobile suit${selectedMobileSuits.length !== 1 ? 's' : ''}`}
            </Button>
          </div>

          {(selectedKits.length > 0 || selectedMobileSuits.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedKits.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Kits ({selectedKits.length}):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedKits.map(kitId => {
                      const kit = kits.find(k => k.id === kitId);
                      return kit ? (
                        <li key={kitId}>• {kit.name} ({kit.number})</li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}

              {selectedMobileSuits.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Selected Mobile Suits ({selectedMobileSuits.length}):</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedMobileSuits.map(msId => {
                      const mobileSuit = mobileSuits.find(ms => ms.id === msId);
                      return mobileSuit ? (
                        <li key={msId}>• {mobileSuit.name}</li>
                      ) : null;
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
