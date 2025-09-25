"use client";

import { useState, memo, useMemo, useCallback, useEffect } from "react";
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

const FilterSection = memo(function FilterSection({
  title,
  options,
  selectedValues,
  onSelectionChange,
  searchPlaceholder,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoized filtered options using debounced search term
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      ),
    [options, debouncedSearchTerm]
  );

  // Memoized option change handler
  const handleOptionChange = useCallback(
    (optionId: string) => {
      const newSelection = selectedValues.includes(optionId)
        ? selectedValues.filter((id) => id !== optionId)
        : [...selectedValues, optionId];
      onSelectionChange(newSelection);
    },
    [selectedValues, onSelectionChange]
  );

  // Memoized search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    []
  );

  // Memoized toggle handler
  const handleToggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // For now, we'll use regular rendering with debouncing for performance
  // Virtualization can be added later if needed for very large lists

  return (
    <div className="border-b border-border pb-4 mb-4">
      <button
        onClick={handleToggle}
        aria-expanded={isExpanded}
        aria-controls={`${title.toLowerCase().replace(/\s+/g, "-")}-options`}
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
        <div
          id={`${title.toLowerCase().replace(/\s+/g, "-")}-options`}
          className="mt-3"
          role="region"
          aria-label={`${title} filter options`}
        >
          {searchPlaceholder && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label={`Search ${title.toLowerCase()} options`}
                className="w-full pl-10 pr-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div
            className="max-h-40 overflow-y-auto space-y-2"
            role="listbox"
            aria-label={`${title} filter options`}
          >
            {filteredOptions.map((option) => (
              <label
                key={option.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.id)}
                  onChange={() => handleOptionChange(option.id)}
                  aria-describedby={`${option.id}-description`}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span
                  id={`${option.id}-description`}
                  className="text-sm text-foreground"
                >
                  {option.name}
                </span>
              </label>
            ))}
            {filteredOptions.length === 0 && (
              <p
                className="text-sm text-muted-foreground p-2"
                role="status"
                aria-live="polite"
              >
                No options found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export { FilterSection };
