"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KitAddImageUpload } from "@/components/kit-add-image-upload";
import { SeriesSelectionDialog } from "@/components/series-selection-dialog";
import { MobileSuitSelectionDialog } from "@/components/mobile-suit-selection-dialog";
import { BaseKitSelectionDialog } from "@/components/base-kit-selection-dialog";
import { ExpansionsSelectionDialog } from "@/components/expansions-selection-dialog";
import { ExpandedBySelectionDialog } from "@/components/expanded-by-selection-dialog";
import {
  updateKitMobileSuits,
  updateKitExpansions,
  updateKitExpandedBy,
} from "@/lib/actions/kits";
import { getAllReleaseTypes } from "@/lib/actions/release-types";
import { getAllProductLines } from "@/lib/actions/product-lines";

import { useAuth } from "@clerk/nextjs";
import { BoxArtUpload } from "./box-art-upload";
import { ProductLine } from "@/lib/types/actions";

export function KitAddForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [productLines, setProductLines] = useState<Array<ProductLine>>([]);
  const [releaseTypes, setReleaseTypes] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);
  const [mobileSuits, setMobileSuits] = useState<
    Array<{
      id: string;
      name: string;
      slug: string | null;
      description: string | null;
      series: string | null;
      timeline: string | null;
      kitsCount: number;
      scrapedImages: string[];
    }>
  >([]);
  const [baseKit, setBaseKit] = useState<{
    id: string;
    name: string;
    slug: string | null;
    number: string;
    variant: string | null;
    releaseDate: Date | null;
    priceYen: number | null;
    boxArt: string | null;
    baseKitId: string | null;
    grade: string | null;
    productLine: string | null;
    series: string | null;
    releaseType: string | null;
    mobileSuits: string[];
  } | null>(null);
  const [expansions, setExpansions] = useState<
    Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant: string | null;
      releaseDate: Date | null;
      priceYen: number | null;
      boxArt: string | null;
      baseKitId: string | null;
      grade: string | null;
      productLine: string | null;
      series: string | null;
      releaseType: string | null;
      mobileSuits: string[];
    }>
  >([]);
  const [expandedBy, setExpandedBy] = useState<
    Array<{
      id: string;
      name: string;
      slug: string | null;
      number: string;
      variant: string | null;
      releaseDate: Date | null;
      priceYen: number | null;
      boxArt: string | null;
      baseKitId: string | null;
      grade: string | null;
      productLine: string | null;
      series: string | null;
      releaseType: string | null;
      mobileSuits: string[];
    }>
  >([]);
  const [pendingImages, setPendingImages] = useState<
    Array<{
      id: string;
      uploadId: string;
      url: string;
      eagerUrl?: string | null;
      caption: string;
      type: string;
      order: number;
      originalFilename: string;
      size: number;
      format: string;
    }>
  >([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    number: "",
    variant: "",
    releaseDate: "",
    priceYen: "",
    region: "",
    boxArt: "",
    notes: "",
    manualLinks: "",
    scrapedImages: "",
    potentialBaseKit: "",
    productLineId: "none",
    seriesId: null as string | null,
    releaseTypeId: "none",
    baseKitId: null as string | null,
  });

  // Fetch product lines and release types on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lines, types] = await Promise.all([
          getAllProductLines(),
          getAllReleaseTypes(),
        ]);
        setProductLines(lines);
        setReleaseTypes(types);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSeriesSelect = (
    seriesId: string | null,
    seriesName: string | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      seriesId: seriesId,
    }));
  };

  const handleMobileSuitsSelect = (selectedMobileSuits: typeof mobileSuits) => {
    setMobileSuits(selectedMobileSuits);
  };

  const handleBaseKitSelect = (selectedBaseKit: typeof baseKit) => {
    setBaseKit(selectedBaseKit);
    setFormData((prev) => ({
      ...prev,
      baseKitId: selectedBaseKit?.id || null,
    }));
  };

  const handleExpansionsSelect = (selectedExpansions: typeof expansions) => {
    setExpansions(selectedExpansions);
  };

  const handleExpandedBySelect = (selectedExpandedBy: typeof expandedBy) => {
    setExpandedBy(selectedExpandedBy);
  };

  const handleImagesChange = (images: typeof pendingImages) => {
    setPendingImages(images);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const createData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        number: formData.number.trim(),
        variant: formData.variant.trim() || undefined,
        releaseDate: formData.releaseDate || undefined,
        priceYen: formData.priceYen ? parseInt(formData.priceYen) : undefined,
        region: formData.region.trim() || undefined,
        boxArt: formData.boxArt.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        manualLinks: formData.manualLinks
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0),
        scrapedImages: formData.scrapedImages
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0),
        potentialBaseKit: formData.potentialBaseKit.trim() || undefined,
        productLineId:
          formData.productLineId === "none"
            ? undefined
            : formData.productLineId || undefined,
        seriesId: formData.seriesId || undefined,
        releaseTypeId:
          formData.releaseTypeId === "none"
            ? undefined
            : formData.releaseTypeId || undefined,
        baseKitId: formData.baseKitId || undefined,
      };

      const token = await getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

      // Call API endpoint to create kit
      const response = await fetch(`${apiUrl}/kits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(createData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create kit");
      }

      const result = await response.json();

      if (result && result.id) {
        // Update mobile suits if any are selected
        if (mobileSuits.length > 0) {
          const mobileSuitIds = mobileSuits.map((ms) => ms.id);
          const mobileSuitsResult = await updateKitMobileSuits(
            result.id,
            mobileSuitIds
          );
          if (!mobileSuitsResult.success) {
            setMessage({
              type: "error",
              text: mobileSuitsResult.error || "Failed to update mobile suits",
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Update expansions if any are selected
        if (expansions.length > 0) {
          const expansionIds = expansions.map((exp) => exp.id);
          const expansionsResult = await updateKitExpansions(
            result.id,
            expansionIds
          );
          if (!expansionsResult.success) {
            setMessage({
              type: "error",
              text: expansionsResult.error || "Failed to update expansions",
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Update expandedBy if any are selected
        if (expandedBy.length > 0) {
          const expandedByIds = expandedBy.map((exp) => exp.id);
          const expandedByResult = await updateKitExpandedBy(
            result.id,
            expandedByIds
          );
          if (!expandedByResult.success) {
            setMessage({
              type: "error",
              text: expandedByResult.error || "Failed to update expanded by",
            });
            setIsSubmitting(false);
            return;
          }
        }

        // Link uploaded images to the kit if any exist
        if (pendingImages.length > 0) {
          try {
            const imagePromises = pendingImages.map((image) =>
              fetch(`${apiUrl}/kits/${result.id}/uploads`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...headers,
                },
                body: JSON.stringify({
                  uploadId: image.uploadId,
                  type: image.type,
                  caption: image.caption || undefined,
                  order: image.order,
                }),
              })
            );

            await Promise.all(imagePromises);
          } catch (error) {
            console.error("Error linking images to kit:", error);
            // Don't fail the whole operation if image linking fails
          }
        }

        setMessage({ type: "success", text: "Kit created successfully!" });

        // Invalidate kits listing queries
        queryClient.invalidateQueries({
          queryKey: ["kits"],
        });

        // Invalidate filter data in case new kit affects filters
        queryClient.invalidateQueries({
          queryKey: ["filterData"],
        });

        setTimeout(() => {
          router.push(`/kits/${result.slug || result.id}`);
        }, 1000);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to create kit",
        });
      }
    } catch (error) {
      console.error("Error creating kit:", error);
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name *{" "}
                  <span className="text-xs text-gray-500">(max 200 chars)</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={200}
                  required
                  placeholder="e.g., RX-78-2 Gundam"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug{" "}
                  <span className="text-xs text-gray-500">
                    (lowercase, numbers, hyphens only)
                  </span>
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  maxLength={200}
                  pattern="^[a-z0-9-]+$"
                  placeholder="auto-generated-slug"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">
                  Number *{" "}
                  <span className="text-xs text-gray-500">(max 100 chars)</span>
                </Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => handleInputChange("number", e.target.value)}
                  maxLength={100}
                  required
                  placeholder="e.g., 001, 0123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variant">
                  Variant{" "}
                  <span className="text-xs text-gray-500">(max 100 chars)</span>
                </Label>
                <Input
                  id="variant"
                  value={formData.variant}
                  onChange={(e) => handleInputChange("variant", e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Ver. Ka, Titanium Finish"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) =>
                    handleInputChange("releaseDate", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceYen">Price (Yen)</Label>
                <Input
                  id="priceYen"
                  type="number"
                  min="0"
                  value={formData.priceYen}
                  onChange={(e) =>
                    handleInputChange("priceYen", e.target.value)
                  }
                  placeholder="e.g., 3500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">
                  Region{" "}
                  <span className="text-xs text-gray-500">(max 100 chars)</span>
                </Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  maxLength={100}
                  placeholder="e.g., Japan, Asia, Global"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productLineId">Product Line</Label>
                <Select
                  value={formData.productLineId}
                  onValueChange={(value) =>
                    handleInputChange("productLineId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Product Line</SelectItem>
                    {productLines.map((productLine) => (
                      <SelectItem key={productLine.id} value={productLine.id}>
                        {productLine.name}
                        {productLine.grade
                          ? ` (${productLine.grade.name})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseTypeId">Release Type</Label>
                <Select
                  value={formData.releaseTypeId}
                  onValueChange={(value) =>
                    handleInputChange("releaseTypeId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a release type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Release Type</SelectItem>
                    {releaseTypes.map((releaseType) => (
                      <SelectItem key={releaseType.id} value={releaseType.id}>
                        {releaseType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seriesId">Series</Label>
                <SeriesSelectionDialog
                  currentSeriesId={formData.seriesId}
                  currentSeriesName={null}
                  onSeriesSelect={handleSeriesSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileSuits">Mobile Suits</Label>
                <MobileSuitSelectionDialog
                  currentMobileSuits={mobileSuits}
                  onMobileSuitsSelect={handleMobileSuitsSelect}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseKit">Base Kit</Label>
                <BaseKitSelectionDialog
                  currentBaseKit={baseKit}
                  onBaseKitSelect={handleBaseKitSelect}
                  excludeKitId={null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expansions">Expansions</Label>
                <ExpansionsSelectionDialog
                  currentExpansions={expansions}
                  onExpansionsSelect={handleExpansionsSelect}
                  excludeKitId={null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expandedBy">Compatible With</Label>
                <ExpandedBySelectionDialog
                  currentExpandedBy={expandedBy}
                  onExpandedBySelect={handleExpandedBySelect}
                  excludeKitId={null}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="potentialBaseKit">Potential Base Kit</Label>
                <Input
                  id="potentialBaseKit"
                  value={formData.potentialBaseKit}
                  onChange={(e) =>
                    handleInputChange("potentialBaseKit", e.target.value)
                  }
                  placeholder="Enter potential base kit ID or reference"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes{" "}
                <span className="text-xs text-gray-500">(max 1000 chars)</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                maxLength={1000}
                placeholder="Additional notes about this kit..."
                rows={3}
              />
            </div>

            <BoxArtUpload
              value={formData.boxArt}
              onChange={(url) => handleInputChange("boxArt", url)}
              label="Box Art"
              id="boxArt"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="manualLinks">Manual URLs (one per line)</Label>
              <Textarea
                id="manualLinks"
                value={formData.manualLinks}
                onChange={(e) =>
                  handleInputChange("manualLinks", e.target.value)
                }
                placeholder="https://example.com/manual1.pdf&#10;https://example.com/manual2.pdf"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scraped Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="scrapedImages">Image URLs (one per line)</Label>
              <Textarea
                id="scrapedImages"
                value={formData.scrapedImages}
                onChange={(e) =>
                  handleInputChange("scrapedImages", e.target.value)
                }
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                rows={6}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload Images</CardTitle>
          </CardHeader>
          <CardContent>
            <KitAddImageUpload
              onImagesChange={handleImagesChange}
              maxFiles={20}
              maxSizeMB={5}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Kit"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
