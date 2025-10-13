"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";

import { getProductLines } from "@/lib/actions/kits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateProductLineForm from "./product-line-form";

export type ProductLine = {
  id?: string;
  name: string;
  slug?: string;
  grade: { name: string };
};

export default function ProductLineFilter({
  selectedValues,
  onChange,
  searchTerm,
  onSearchChange,
}: {
  selectedValues: ProductLine[];
  onChange: (values: ProductLine[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogAddProductLine, setOpenAddProductLine] =
    useState<boolean>(false);

  const TAKE = 20;

  // 🧠 Load cached product lines first
  useEffect(() => {
    const cached = localStorage.getItem("productLines");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setProductLines(parsed);
      } catch (err) {
        console.warn("Failed to parse cached product lines", err);
      }
    }
  }, []);

  // 🧠 Save to localStorage whenever productLines change
  useEffect(() => {
    if (productLines.length > 0) {
      localStorage.setItem("productLines", JSON.stringify(productLines));
    }
  }, [productLines]);

  // 🧠 Fetch + merge local and server product lines
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const { productLines: lines, totalCount } = await getProductLines({
        search: searchTerm,
        skip: 0,
        take: TAKE,
      });

      setProductLines((prev) => {
        const localOnly = prev.filter((p: any) => p.isLocal);
        const merged = [
          ...localOnly, // 🧠 Keep local ones always
          ...lines.filter((l) => !localOnly.some((lo) => lo.id === l.id)),
        ];
        return merged;
      });

      setSkip(lines.length);
      setHasMore(lines.length < totalCount);
      setIsLoading(false);
    };

    fetchInitial();
  }, [searchTerm]);

  // ♾ Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);

          const { productLines: newLines, totalCount } = await getProductLines({
            search: searchTerm,
            skip,
            take: TAKE,
          });

          setProductLines((prev) => {
            const merged = [
              ...prev.filter((p) => !newLines.some((l) => l.id === p.id)),
              ...newLines,
            ];
            return merged;
          });

          setSkip((prev) => prev + newLines.length);
          setHasMore(skip + newLines.length < totalCount);
          setIsLoading(false);
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [skip, hasMore, isLoading, searchTerm]);

  // ✅ Handle selection toggles
  const handleToggleOption = (option: ProductLine) => {
    const isSelected = selectedValues.some((item) => item.id === option.id);
    onChange(
      isSelected
        ? selectedValues.filter((item) => item.id !== option.id)
        : [...selectedValues, option]
    );
  };

  // ✅ Handle creation of a new product line
  const handleNewProductLine = (newProductLine: ProductLine) => {
    // Add to localStorage
    const existing = JSON.parse(localStorage.getItem("productLines") || "[]");
    const updated = [newProductLine, ...existing];
    localStorage.setItem("productLines", JSON.stringify(updated));

    // Update state + select it
    setProductLines((prev) => [newProductLine, ...prev]);
    onChange([...selectedValues, newProductLine]);
    setOpenAddProductLine(false);
  };

  return (
    <div className="relative" data-popover>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center"
      >
        <span>Product Lines</span>
        <span>{selectedValues.length > 0 ? selectedValues.length : ""}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Header */}
          <div className="p-3 border-b flex justify-between items-center">
            <Button variant="ghost" onClick={() => onChange([])}>
              Reset
            </Button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search + Add */}
          <div className="flex gap-2 px-3 py-2">
            <input
              type="text"
              placeholder="Search product lines..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />

            <Dialog
              open={openDialogAddProductLine}
              onOpenChange={setOpenAddProductLine}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add new product line</DialogTitle>
                </DialogHeader>
                <CreateProductLineForm
                  onSuccess={(newProductLine: ProductLine) => {
                    // Mark as local so it won't be removed on future fetches
                    const localLine = { ...newProductLine, isLocal: true };

                    // Add to list and persist
                    setProductLines((prev) => [localLine, ...prev]);
                    localStorage.setItem(
                      "productLines",
                      JSON.stringify([localLine, ...productLines])
                    );

                    // Auto-select
                    onChange([...selectedValues, localLine]);

                    setOpenAddProductLine(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* List */}
          {productLines.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              No product lines found.
            </div>
          ) : (
            productLines.map((option) => (
              <label
                key={option.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.some(
                      (item) => item.id === option.id
                    )}
                    onChange={() => handleToggleOption(option)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-900">
                    {option.name}
                  </span>
                </div>
              </label>
            ))
          )}

          {/* Infinite scroll sentinel */}
          <div
            ref={observerRef}
            className="h-10 flex justify-center items-center"
          >
            {isLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
