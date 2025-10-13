"use client";

import { useEffect, useState } from "react";
import { nanoid } from "nanoid";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProductLine } from "./product-line-filter";

type Grade = { id: string; name: string };
type Vendor = { id: string; name: string };

interface CreateProductLineFormProps {
  onSuccess?: (productLine: ProductLine) => void;
}

export default function CreateProductLineForm({
  onSuccess,
}: CreateProductLineFormProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    gradeId: "",
    vendorId: "",
    logoId: "",
    scrapedImage: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

      const [gradesRes, vendorsRes] = await Promise.all([
        fetch(
          `${apiUrl}/grades?select=id,slug,name&limit=100&sort=name:asc`
        ).then((r) => r.json()),
        fetch(
          `${apiUrl}/vendors?select=id,slug,name&limit=100&sort=name:asc`
        ).then((r) => r.json()),
      ]);
      if (gradesRes?.items) setGrades(gradesRes.items);
      if (vendorsRes?.items) setVendors(vendorsRes.items);
    };
    fetchData();
  }, []);

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
      alert("Please enter a product line name");
      return;
    }

    setLoading(true);

    try {
      // Find the selected grade to get its name
      const selectedGrade = grades.find((g) => g.id === formData.gradeId);

      // Create the new product line matching the ProductLine type
      const newProductLine: ProductLine = {
        name: formData.name,
        id: nanoid(),
        grade: {
          name: selectedGrade?.name || "",
        },
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
        <select
          name="gradeId"
          onChange={handleChange}
          value={formData.gradeId}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">Select Grade</option>
          {Array.isArray(grades)
            ? grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))
            : null}
        </select>
      </div>

      {/* Vendor */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Vendor
        </label>
        <select
          name="vendorId"
          onChange={handleChange}
          value={formData.vendorId}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          <option value="">Select Vendor</option>
          {Array.isArray(vendors)
            ? vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))
            : null}
        </select>
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
