"use client";

import { useState } from "react";
import { nanoid } from "nanoid";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Vendor } from "./vendor-filter";

interface CreateVendorFormProps {
  onSuccess?: (vendor: Vendor) => void;
}

export default function CreateVendorForm({ onSuccess }: CreateVendorFormProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      alert("Please enter a vendor name");
      return;
    }

    setLoading(true);

    try {
      // Find the selected grade to get its name

      // Create the new product line matching the ProductLine type
      const newProductLine: Vendor = {
        name: formData.name,
        id: nanoid(),
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
      };

      // Reset form
      setFormData({
        name: "",
        description: "",
        slug: "",
      });

      // Call onSuccess callback if provided (e.g., to close dialog)
      onSuccess?.(newProductLine);
    } catch (error) {
      console.error("Error creating product line:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. HGUC, MGEX, PG Unleashed"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
          rows={3}
          placeholder="Optional description"
        />
      </div>
      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Slug</label>
        <Input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          placeholder="Optional slug (auto-generated from name if left blank)"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Product Line"}
      </button>
    </form>
  );
}
