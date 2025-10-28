"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateProductLineForm from "./create-product-line-form";
import { getProductLines } from "@/lib/actions/product-lines";

export type ProductLine = {
  id?: string;
  name: string;
  slug?: string;
  grade?: { name: string };
  logo?: string;
  vendor?: { name: string };
};

export default function ProductLineFilter({
  selectedValue,
  onChange,
  searchTerm,
  onSearchChange,
}: {
  selectedValue: ProductLine | null;
  onChange: (value: ProductLine | null) => void;
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
  const PRODUCT_LINE_LOCAL_STORAGE_KEY = "productLines";

  // Load cached product lines first
  useEffect(() => {
    const cached = localStorage.getItem(PRODUCT_LINE_LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        setProductLines(JSON.parse(cached));
      } catch (err) {
        console.warn("Failed to parse cached product lines", err);
      }
    }
  }, []);

  // Fetch initial product lines
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const { productLines: lines, totalCount } = await getProductLines({
        search: searchTerm,
        skip: 0,
        take: TAKE,
      });

      const cached = JSON.parse(
        localStorage.getItem(PRODUCT_LINE_LOCAL_STORAGE_KEY) || "[]"
      );

      const matchingLocal = cached.filter((s: ProductLine) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const merged = [...matchingLocal, ...lines].filter(
        (s, index, self) => index === self.findIndex((x) => x.id === s.id)
      );

      setSkip(lines.length);
      setHasMore(lines.length < totalCount);
      setIsLoading(false);
      setProductLines(merged);
    };

    fetchInitial();
  }, [searchTerm]);

  // Infinite scroll observer
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

  // Handle single selection
  const handleSelect = (option: ProductLine) => {
    onChange(selectedValue && selectedValue.id === option.id ? null : option);
    setIsOpen(false); // close dropdown after selecting
  };

  return (
    <div className="relative" data-popover>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center"
      >
        <span>
          {selectedValue?.name !== ""
            ? selectedValue.name
            : "Select Product Line"}
        </span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {/* Header */}
          <div className="p-3 border-b flex justify-end items-center">
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
                    const localLine = { ...newProductLine, isLocal: true };
                    setProductLines((prev) => [localLine, ...prev]);
                    localStorage.setItem(
                      PRODUCT_LINE_LOCAL_STORAGE_KEY,
                      JSON.stringify([localLine, ...productLines])
                    );
                    onChange(localLine);
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
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedValue?.id === option.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedValue?.id === option.id}
                    onChange={() => handleSelect(option)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
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
