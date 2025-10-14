"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ProductLineFilter from "./product-line-filter";
import { SeriesFilter } from "./series-filter";
import { Kit, KitsFilter } from "./kits-filter";
import { MobileSuit, MobileSuitsFilter } from "./mobile-suits-filter";
import { KitExpansionFilter } from "./kit-expansions-filter";
import { KitCompatibleFilter } from "./kit-compatible-fitler";
import { KitImageUploadForm } from "./kit-image-upload-form";

export default function KitForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    number: "",
    variant: "",
    releaseDate: "",
    price: "",
    region: "",
    boxArtUrl: "",
    productLines: [],
    series: {
      id: "",
      name: "",
    },
    mobileSuits: [],
    baseKit: null,
    expansions: [],
    compatibleWith: [],
    images: [],
  });

  const [productLineSearch, setProductLineSearch] = useState("");

  const steps = [
    { title: "Basic Info", description: "Name and identification" },
    { title: "Pricing & Release", description: "Price and availability" },
    { title: "Product Details", description: "Line and series" },
    { title: "Uploads", description: "Upload images" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    alert("Model Kit saved successfully!");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <p className="text-slate-600 mb-8">
            Add a new model kit to your collection
          </p>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div
                    className="flex flex-col items-center"
                    style={{ width: "120px" }}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-all ${
                        index < currentStep
                          ? "bg-green-500 text-white"
                          : index === currentStep
                          ? "bg-blue-600 text-white ring-4 ring-blue-100"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {index < currentStep ? <Check size={22} /> : index + 1}
                    </div>
                    <div className="text-center mt-3">
                      <p
                        className={`text-sm font-semibold ${
                          index === currentStep
                            ? "text-slate-800"
                            : "text-slate-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p
                        className={`text-xs mt-1 ${
                          index === currentStep
                            ? "text-slate-600"
                            : "text-slate-400"
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="flex items-center"
                      style={{
                        width: "calc(100% / 3 - 160px)",
                        marginTop: "24px",
                      }}
                    >
                      <div
                        className={`h-0.5 w-full transition-all ${
                          index < currentStep ? "bg-green-500" : "bg-slate-300"
                        }`}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="min-h-[400px]">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="name">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., RX-93 ν Gundam"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      name="slug"
                      id="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="e.g., pgu-02"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="number">
                      Model Number<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      name="number"
                      id="number"
                      value={formData.number}
                      onChange={handleChange}
                      placeholder="e.g., 02"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="variant">Variant </Label>
                    <Input
                      type="text"
                      name="variant"
                      id="variant"
                      value={formData.variant}
                      onChange={handleChange}
                      placeholder="e.g., Ver. Ka, Titanium Finish"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pricing & Release */}
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
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (Yen)</Label>
                    <Input
                      type="number"
                      name="price"
                      id="price"
                      value={formData.price}
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
                    <Label htmlFor="boxArtUrl">Box Art URL</Label>
                    <Input
                      type="url"
                      name="boxArtUrl"
                      id="boxArtUrl"
                      value={formData.boxArtUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Product Details */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Product Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="productLine">Product Line </Label>
                    <ProductLineFilter
                      selectedValues={formData.productLines}
                      onChange={(values) => {
                        console.info({ values });
                        setFormData((prev) => ({
                          ...prev,
                          productLines: values,
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
                        currentSeriesId={formData.series.id || ""}
                        currentSeriesName={formData.series.name || ""}
                        onSeriesSelect={(seriesId, seriesName) => {
                          setFormData((prev) => ({
                            ...prev,
                            series: {
                              id: seriesId,
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

            {/* Step 4: Uploads */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold text-slate-700 mb-4">
                  Uploads
                </h2>

                <KitImageUploadForm
                  initialFiles={formData.images}
                  maxFiles={10}
                  maxSizeMB={5}
                  onChange={(images) => {
                    setFormData((prev) => ({
                      ...prev,
                      images,
                    }));
                  }}
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
