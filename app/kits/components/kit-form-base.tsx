"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProductLineFilter, { ProductLine } from "./product-line-filter";
import { SeriesFilter } from "./series-filter";
import { Kit, KitsFilter } from "./kits-filter";
import { MobileSuit, MobileSuitsFilter } from "./mobile-suits-filter";
import { KitExpansionFilter } from "./kit-expansions-filter";
import { KitCompatibleFilter } from "./kit-compatible-fitler";
import { ImageItem, KitImageUploadForm } from "./kit-image-upload-form";
import Stepper from "./stepper";
import { BasicInfoStep } from "./basic-info-step";

export interface KitFormData {
  name: string;
  slug: string;
  number: string;
  variant: string;
  releaseDate: string;
  priceYen: string;
  region: string;
  boxArt: string;
  productLine: ProductLine;
  series: { slug: string; name: string };
  mobileSuits: MobileSuit[];
  baseKit: Kit | null;
  expansions: Kit[];
  compatibleWith: Kit[];
  uploads: ImageItem[];
}

interface KitFormBaseProps {
  mode?: "create" | "edit";
  initialData?: Partial<KitFormData>;
  onSubmit: (data: KitFormData) => void;
}

export default function KitFormBase({
  mode = "create",
  initialData = {},
  onSubmit,
}: KitFormBaseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<KitFormData>({
    name: "",
    slug: "",
    number: "",
    releaseDate: "",
    priceYen: "",
    region: "",
    boxArt: "",
    productLine: { name: "", logo: "" },
    series: { slug: "", name: "" },
    mobileSuits: [],
    baseKit: null,
    expansions: [],
    compatibleWith: [],
    uploads: [],
    variant: "",
    ...initialData, // preload data when editing
  });

  const [productLineSearch, setProductLineSearch] = useState("");

  const steps = [
    { title: "Basic Info", description: "Name and identification" },
    { title: "Pricing & Release", description: "Price and availability" },
    { title: "Product Details", description: "Line and series" },
    { title: "Uploads", description: "Upload image" },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () =>
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => onSubmit(formData);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-slate-600 mb-8">
            {mode === "create"
              ? "Add a new model kit to your collection"
              : "Edit model kit details"}
          </p>

          {/* Stepper */}
          <Stepper steps={steps} currentStep={currentStep} />

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 0 && (
              <BasicInfoStep formData={formData} handleChange={handleChange} />
            )}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Pricing & Release Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="releaseDate">
                      Release Date<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="date"
                      name="releaseDate"
                      id="releaseDate"
                      value={
                        new Date(formData.releaseDate)
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="priceYen">Price (Yen)</Label>
                    <Input
                      type="number"
                      name="priceYen"
                      id="priceYen"
                      value={formData.priceYen}
                      onChange={handleChange}
                      placeholder="e.g., 6000"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="region">Region</Label>
                    <Input
                      type="text"
                      name="region"
                      id="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="e.g., Japan, Asia, Global"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="boxArt">Box Art URL</Label>
                    <Input
                      type="url"
                      name="boxArt"
                      id="boxArt"
                      value={formData.boxArt}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Product Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="productLine">Product Line </Label>
                    <ProductLineFilter
                      selectedValue={formData.productLine}
                      onChange={(values) => {
                        setFormData((prev) => ({
                          ...prev,
                          productLine: values,
                        }));
                      }}
                      searchTerm={productLineSearch}
                      onSearchChange={(term: string) => {
                        setProductLineSearch(term);
                      }}
                    />
                  </div>

                  <div>
                    <div className="space-y-2">
                      <Label>Series</Label>
                      <SeriesFilter
                        currentSeriesSlug={formData.series.slug || ""}
                        currentSeriesName={formData.series.name || ""}
                        onSeriesSelect={(seriesSlug, seriesName) => {
                          setFormData((prev) => ({
                            ...prev,
                            series: {
                              slug: seriesSlug,
                              name: seriesName,
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="mobileSuits">Mobile Suit</Label>
                    <MobileSuitsFilter
                      currentMobileSuits={formData.mobileSuits}
                      onMobileSuitsSelect={(mobileSuits: MobileSuit[]) => {
                        setFormData((prev) => ({
                          ...prev,
                          mobileSuits,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="baseKit">Base Kit </Label>
                    <KitsFilter
                      currentKit={formData.baseKit}
                      onKitSelect={function (baseKit: Kit): void {
                        setFormData((prev) => ({
                          ...prev,
                          baseKit,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="expansions">Expansions</Label>
                    <KitExpansionFilter
                      currentExpansions={formData.expansions}
                      onExpansionsSelect={(expansions: Kit[]) => {
                        setFormData((prev) => ({
                          ...prev,
                          expansions,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <Label htmlFor="compatibleWith">Compatible With </Label>
                    <KitCompatibleFilter
                      currentExpandedBy={formData.compatibleWith}
                      onExpandedBySelect={(expandedBy: Kit[]) => {
                        setFormData((prev) => ({
                          ...prev,
                          compatibleWith: expandedBy,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Uploads
                </h2>

                <KitImageUploadForm
                  initialFiles={formData.uploads}
                  maxFiles={10}
                  maxSizeMB={5}
                  onChange={(uploads) => {
                    setFormData((prev) => ({
                      ...prev,
                      uploads,
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition ${
                currentStep === 0
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              <ChevronLeft size={20} className="mr-1" />
              Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Next
                <ChevronRight size={20} className="ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md hover:shadow-lg"
              >
                <Check size={20} className="mr-2" />
                Save Model Kit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
