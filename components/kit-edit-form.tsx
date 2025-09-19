"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KitImageUpload } from "@/components/kit-image-upload";
import { updateKit } from "@/lib/actions/kits";
import { deleteKitUpload } from "@/lib/actions/uploads";
import { KitImageType } from "@/generated/prisma";

interface KitEditFormProps {
  kit: {
    id: string;
    name: string;
    slug: string | null;
    number: string;
    variant?: string | null;
    releaseDate?: Date | null;
    priceYen?: number | null;
    region?: string | null;
    boxArt?: string | null;
    notes?: string | null;
    scrapedImages: string[];
    uploads: Array<{
      id: string;
      url: string;
      type: string;
      title?: string | null;
      description?: string | null;
      createdAt: Date;
    }>;
  };
}

export function KitEditForm({ kit }: KitEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: kit.name,
    slug: kit.slug || "",
    number: kit.number,
    variant: kit.variant || "",
    releaseDate: kit.releaseDate ? new Date(kit.releaseDate).toISOString().split('T')[0] : "",
    priceYen: kit.priceYen?.toString() || "",
    region: kit.region || "",
    boxArt: kit.boxArt || "",
    notes: kit.notes || "",
    scrapedImages: kit.scrapedImages.join('\n'),
  });


  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleScrapedImagesChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      scrapedImages: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First, delete any removed files
      console.log('Removed file IDs to delete:', removedFileIds);
      for (const fileId of removedFileIds) {
        try {
          console.log(`Deleting file ${fileId}...`);
          await deleteKitUpload(fileId);
          console.log(`Successfully deleted file ${fileId}`);
        } catch (error) {
          console.error(`Error deleting file ${fileId}:`, error);
        }
      }

      const updateData = {
        name: formData.name,
        slug: formData.slug || null,
        number: formData.number,
        variant: formData.variant || null,
        releaseDate: formData.releaseDate ? new Date(formData.releaseDate) : null,
        priceYen: formData.priceYen ? parseInt(formData.priceYen) : null,
        region: formData.region || null,
        boxArt: formData.boxArt || null,
        notes: formData.notes || null,
        scrapedImages: formData.scrapedImages
          .split('\n')
          .map(url => url.trim())
          .filter(url => url.length > 0),
      };

      const result = await updateKit(kit.id, updateData);

      if (result.success) {
        setMessage({ type: 'success', text: "Kit updated successfully!" });
        setTimeout(() => {
          router.push(`/kits/${result.kit.slug || kit.slug}`);
        }, 1000);
      } else {
        setMessage({ type: 'error', text: result.error || "Failed to update kit" });
      }
    } catch (error) {
      console.error("Error updating kit:", error);
      setMessage({ type: 'error', text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
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
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="auto-generated-slug"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Number *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="variant">Variant</Label>
              <Input
                id="variant"
                value={formData.variant}
                onChange={(e) => handleInputChange("variant", e.target.value)}
                placeholder="e.g., Ver. Ka, Titanium Finish"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => handleInputChange("releaseDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceYen">Price (Yen)</Label>
              <Input
                id="priceYen"
                type="number"
                value={formData.priceYen}
                onChange={(e) => handleInputChange("priceYen", e.target.value)}
                placeholder="e.g., 3500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="e.g., Japan, Asia, Global"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boxArt">Box Art URL</Label>
              <Input
                id="boxArt"
                value={formData.boxArt}
                onChange={(e) => handleInputChange("boxArt", e.target.value)}
                placeholder="https://example.com/box-art.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Additional notes about this kit..."
              rows={3}
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
              onChange={(e) => handleScrapedImagesChange(e.target.value)}
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
          <KitImageUpload
            kitId={kit.id}
            initialFiles={kit.uploads.map(upload => ({
              id: upload.id, // Use the upload ID for deletion
              name: upload.title || "Uploaded Image",
              size: 0,
              type: "image/jpeg",
              url: upload.url,
            }))}
            onRemovedFilesChange={(removedIds) => {
              console.log('Parent received removed file IDs:', removedIds);
              setRemovedFileIds(removedIds);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
      </form>
    </div>
  );
}
