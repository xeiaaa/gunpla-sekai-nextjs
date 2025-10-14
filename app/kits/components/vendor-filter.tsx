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
import CreateVendorForm from "./create-vendor-form";

export type Vendor = {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
};

export async function getVendors({
  search = "",
  skip = 0,
  take = 20,
}: {
  search?: string;
  skip?: number;
  take?: number;
}) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const url = new URL(`${apiUrl}/vendors`);
    url.searchParams.set("select", "id,slug,name");
    url.searchParams.set("limit", take.toString());
    url.searchParams.set("sort", "name:asc");
    if (search) url.searchParams.set("search", encodeURIComponent(search));
    if (skip) url.searchParams.set("skip", skip.toString());

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 }, // (optional, for Next.js caching)
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch vendors: ${res.statusText}`);
    }

    const data = await res.json();

    return {
      items: data.items ?? [],
      meta: data.meta,
    };
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return { vendors: [], totalCount: 0 };
  }
}
export default function VendorFilter({
  selectedValue,
  onChange,
}: {
  selectedValue: Vendor | null;
  onChange: (value: Vendor | null) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [openDialogAddVendor, setOpenAddVendor] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const LIMIT = 20;
  const VENDOR_LOCAL_STORAGE_KEY = "vendors";

  // 🧠 Load cached vendors first
  useEffect(() => {
    const cached = localStorage.getItem(VENDOR_LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        setVendors(JSON.parse(cached));
      } catch (err) {
        console.warn("Failed to parse cached vendors", err);
      }
    }
  }, []);

  // 🧠 Fetch initial vendors
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoading(true);
      const { items, meta } = await getVendors({
        search: searchTerm,
        skip: 1,
        take: LIMIT,
      });

      const cached = JSON.parse(
        localStorage.getItem(VENDOR_LOCAL_STORAGE_KEY) || "[]"
      );

      const matchingLocal = cached.filter((v: Vendor) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const merged = [...matchingLocal, ...items].filter(
        (v, i, self) => i === self.findIndex((x) => x.id === v.id)
      );

      setPage(1);
      setHasMore(meta.page < meta.totalPages);
      setIsLoading(false);
      setVendors(merged);
    };

    fetchInitial();
  }, [searchTerm]);

  // ♾ Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;

    const controller = new AbortController();

    const observer = new IntersectionObserver(
      async (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          setIsLoading(true);

          try {
            const nextPage = page + 1;
            const {
              vendors: items,
              totalCount,
              meta,
            } = await getVendors({
              search: searchTerm,
              skip: nextPage,
              take: LIMIT,
            });

            setVendors((prev) => {
              const merged = [
                ...prev.filter((v) => !items.some((nv) => nv.id === v.id)),
                ...items,
              ];
              return merged;
            });

            setPage(nextPage);
            const totalPages =
              meta?.totalPages ??
              Math.ceil((totalCount ?? 0) / (meta?.limit ?? LIMIT)) ??
              1;
            setHasMore(nextPage < totalPages);
          } catch (err) {
            console.error("Error fetching next vendors:", err);
          } finally {
            setIsLoading(false);
          }
        }
      },
      { threshold: 1.0 }
    );

    const current = observerRef.current;
    observer.observe(current);

    return () => {
      observer.disconnect();
      controller.abort(); // cleanup fetch
    };
  }, [page, hasMore, isLoading, searchTerm, LIMIT]);

  // ✅ Handle single select
  const handleSelect = (option: Vendor) => {
    onChange(selectedValue && selectedValue.id === option.id ? null : option);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="text-sm bg-background border border-slate-300 rounded-lg px-4 py-3 w-full flex justify-between items-center cursor-pointer">
          <span>{selectedValue ? selectedValue.name : "Select Vendor"}</span>
          {selectedValue && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Vendor</DialogTitle>
        </DialogHeader>

        {/* Search + Add */}
        <div className="flex gap-2 px-3 py-2">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />

          <Dialog open={openDialogAddVendor} onOpenChange={setOpenAddVendor}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add new vendor</DialogTitle>
              </DialogHeader>
              <CreateVendorForm
                onSuccess={(newVendor: Vendor) => {
                  const localVendor = { ...newVendor, isLocal: true };
                  setVendors((prev) => [localVendor, ...prev]);
                  localStorage.setItem(
                    VENDOR_LOCAL_STORAGE_KEY,
                    JSON.stringify([localVendor, ...vendors])
                  );
                  onChange(localVendor);
                  setOpenAddVendor(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* List */}
        {vendors.length === 0 && !isLoading ? (
          <div className="p-4 text-center text-gray-500">No vendors found.</div>
        ) : (
          vendors.map((option) => (
            <div key={option.id} className="w-full">
              <label
                onClick={() => handleSelect(option)}
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
                  selectedValue?.id === option.id ? "bg-blue-50" : ""
                }`}
                htmlFor={option.id || option.name}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name={option.id || option.name}
                    checked={selectedValue?.id === option.id}
                    onChange={() => handleSelect(option)}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-900">
                    {option.name}
                  </span>
                </div>
              </label>
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
