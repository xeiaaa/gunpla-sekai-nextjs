"use client";

import { useState } from "react";
import { nanoid } from "nanoid";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SeriesForm({
  onSuccess,
}: {
  onSuccess: (newSeries: {
    id: string;
    name: string;
    slug: string | null;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      onSuccess({
        name,
        id: nanoid(),
        slug: "",
      });
    } catch (error) {
      console.error("Error creating series:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label htmlFor="series-name">Series Name</Label>
        <Input
          id="series-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Gundam SEED"
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
