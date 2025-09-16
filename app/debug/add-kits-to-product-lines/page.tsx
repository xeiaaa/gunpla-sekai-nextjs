"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAllKits, updateKitProductLine } from "@/lib/actions/kits";
import { getAllProductLines } from "@/lib/actions/product-lines";
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
  grade: string;
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

interface ProductLine {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  gradeName: string;
  kitsCount: number;
  scrapedImage: string | null;
}

export default function AddKitsToProductLinesPage() {
  const [kits, setKits] = useState<Kit[]>([]);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [selectedKits, setSelectedKits] = useState<string[]>([]);
  const [selectedProductLine, setSelectedProductLine] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kitsData, productLinesData] = await Promise.all([
          getAllKits(),
          getAllProductLines(),
        ]);
        setKits(kitsData);
        setProductLines(productLinesData);
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

  // Filter kits based on search term
  const filteredKits = kits.filter(kit =>
    kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kit.productLine?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (kit.series?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    kit.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.mobileSuits.some(ms => ms.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectAll = () => {
    if (selectedKits.length === filteredKits.length) {
      setSelectedKits([]);
    } else {
      setSelectedKits(filteredKits.map(kit => kit.id));
    }
  };

  const handleUpdateProductLine = async () => {
    if (selectedKits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one kit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const productLineId = selectedProductLine === "" ? null : selectedProductLine;
      const result = await updateKitProductLine(selectedKits, productLineId);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully updated ${result.updatedCount} kits`
        });

        // Refresh the kits data
        const updatedKits = await getAllKits();
        setKits(updatedKits);
        setSelectedKits([]);
        setSelectedProductLine("");
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update kits' });
      }
    } catch (error) {
      console.error('Error updating kits:', error);
      setMessage({ type: 'error', text: 'Failed to update kits' });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveFromProductLine = async () => {
    if (selectedKits.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one kit' });
      return;
    }

    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateKitProductLine(selectedKits, null);

      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully removed ${result.updatedCount} kits from product line`
        });

        // Refresh the kits data
        const updatedKits = await getAllKits();
        setKits(updatedKits);
        setSelectedKits([]);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to remove kits from product line' });
      }
    } catch (error) {
      console.error('Error removing kits from product line:', error);
      setMessage({ type: 'error', text: 'Failed to remove kits from product line' });
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
        <h1 className="text-3xl font-bold">Add Kits to Product Lines</h1>
        <p className="text-muted-foreground mt-2">
          Select multiple kits and assign them to a product line, or remove them from their current product line.
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
              Choose which kits to assign to a product line
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selectedKits.length} of {filteredKits.length} selected
                {searchTerm && ` (${kits.length} total)`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredKits.length === 0}
              >
                {selectedKits.length === filteredKits.length && filteredKits.length > 0 ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredKits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No kits found matching your search.' : 'No kits available.'}
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

        {/* Product Line Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign to Product Line</CardTitle>
            <CardDescription>
              Choose a product line to assign the selected kits to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="product-line-select" className="block text-sm font-medium mb-2">
                Select Product Line
              </label>
              <select
                id="product-line-select"
                value={selectedProductLine}
                onChange={(e) => setSelectedProductLine(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">No product line (remove from current)</option>
                {productLines.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.kitsCount} kits) • {pl.gradeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleUpdateProductLine}
                disabled={updating || selectedKits.length === 0}
                className="w-full"
              >
                {updating ? 'Updating...' : 'Assign to Product Line'}
              </Button>

              <Button
                variant="outline"
                onClick={handleRemoveFromProductLine}
                disabled={updating || selectedKits.length === 0}
                className="w-full"
              >
                {updating ? 'Removing...' : 'Remove from Product Line'}
              </Button>
            </div>

            {selectedKits.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Selected Kits:</h4>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
