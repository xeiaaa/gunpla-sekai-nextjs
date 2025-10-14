"use client";

import { useState } from "react";
import { nanoid } from "nanoid";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductLine } from "./product-line-filter";
import VendorFilter, { Vendor } from "./vendor-filter";
import GradeFilter, { Grade } from "./grade-filter";

interface CreateProductLineFormProps {
  onSuccess?: (productLine: ProductLine) => void;
}

export default function CreateProductLineForm({
  onSuccess,
}: CreateProductLineFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradeId: "",
    vendorId: "",
    logoId: "",
    scrapedImage: "",
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
      return;
    }

    setLoading(true);

    try {
      // Find the selected grade to get its name

      // Create the new product line matching the ProductLine type
      const newProductLine: ProductLine = {
        name: formData.name,
        id: nanoid(),
        grade: selectedGrade,
        vendor: selectedVendor,
      };

      // Reset form
      setFormData({
        name: "",
        description: "",
        gradeId: "",
        vendorId: "",
        logoId: "",
        scrapedImage: "",
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

      {/* Grade */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Grade</label>
        <GradeFilter
          selectedValue={selectedGrade}
          onChange={function (value: Grade | null): void {
            setSelectedGrade(value);
          }}
        />
      </div>

      {/* Vendor */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Vendor
        </label>

        <VendorFilter
          selectedValue={selectedVendor}
          onChange={function (value: Vendor | null): void {
            setSelectedVendor(value);
          }}
        />
      </div>

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
