"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

interface FilterOption {
  id: string;
  name: string;
  slug: string | null;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  searchPlaceholder?: string;
}

export function FilterSection({
  title,
  options,
  selectedValues,
  onSelectionChange,
  searchPlaceholder,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOptionChange = (optionId: string) => {
    const newSelection = selectedValues.includes(optionId)
      ? selectedValues.filter(id => id !== optionId)
      : [...selectedValues, optionId];
    onSelectionChange(newSelection);
  };

  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left font-medium hover:text-primary transition-colors"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3">
          {searchPlaceholder && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.id)}
                  onChange={() => handleOptionChange(option.id)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{option.name}</span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">No options found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
