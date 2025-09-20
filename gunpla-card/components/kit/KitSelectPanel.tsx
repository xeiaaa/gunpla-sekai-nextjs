"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCardBuilder } from "@/gunpla-card/context";
import { getFilteredKitsWithMeilisearch } from "@/lib/actions/meilisearch-kits";

interface SimpleKit {
  id: string;
  name: string;
  boxArt?: string | null;
  grade?: string | null;
  productLine?: string | null;
  series?: string | null;
}

export const KitSelectPanel: React.FC = () => {
  const { setSelectedKit, setActiveTab, addUploadedImages } = useCardBuilder();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SimpleKit[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFilteredKitsWithMeilisearch({ searchTerm: q, limit: 8, offset: 0, sortBy: "relevance", order: "most-relevant" });
      const kits: SimpleKit[] = res.kits.map((k: any) => ({ id: k.id, name: k.name, boxArt: k.boxArt, grade: k.grade, productLine: k.productLine, series: k.series }));
      setResults(kits);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { const t = setTimeout(() => { if (q.trim()) search(); }, 300); return () => clearTimeout(t); }, [q, search]);

  const handleSelect = useCallback(async (kit: SimpleKit) => {
    setSelectedKit({ id: kit.id, name: kit.name });
    try {
      const res = await fetch(`/api/gunpla-card/kit-media?kitId=${encodeURIComponent(kit.id)}`);
      const data = await res.json();
      if (Array.isArray(data.images) && data.images.length) {
        addUploadedImages(data.images);
      } else if (kit.boxArt) {
        addUploadedImages([kit.boxArt]);
      }
    } catch {
      if (kit.boxArt) addUploadedImages([kit.boxArt]);
    }
    setActiveTab("upload");
  }, [setSelectedKit, addUploadedImages, setActiveTab]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Search kit name or number..." value={q} onChange={e => setQ(e.target.value)} />
        <Button onClick={search} disabled={loading}>Search</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {results.map(kit => (
          <button key={kit.id} className="text-left border rounded p-2 hover:bg-muted" onClick={() => handleSelect(kit)}>
            {kit.boxArt ? (
              <div className="w-full h-36 relative">
                <Image src={kit.boxArt} alt={kit.name} fill className="object-cover rounded" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw" />
              </div>
            ) : (
              <div className="w-full h-36 bg-muted rounded" />
            )}
            <div className="mt-2 text-sm font-medium line-clamp-2">{kit.name}</div>
            <div className="text-xs text-muted-foreground">{kit.grade ?? ""} {kit.productLine ? `• ${kit.productLine}` : ""}</div>
            <div className="text-xs text-muted-foreground">{kit.series ?? ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default KitSelectPanel;


