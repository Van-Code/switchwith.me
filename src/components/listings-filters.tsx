"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from "lucide-react";

interface ListingsFiltersProps {
  currentSearch?: string;
  currentSort?: string;
  currentSection?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentFrom?: string;
  currentTo?: string;
}

export default function ListingsFilters({
  currentSearch,
  currentSort = "createdDesc",
  currentSection,
  currentMinPrice,
  currentMaxPrice,
  currentFrom,
  currentTo,
}: ListingsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for filter inputs
  const [section, setSection] = useState(currentSection ?? "");
  const [minPrice, setMinPrice] = useState(currentMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? "");
  const [fromDate, setFromDate] = useState(currentFrom ?? "");
  const [toDate, setToDate] = useState(currentTo ?? "");

  // Update URL with new params while preserving others
  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    updateParams({ sort: value });
  };

  // Apply filters
  const applyFilters = () => {
    updateParams({
      section: section,
      minPrice: minPrice,
      maxPrice: maxPrice,
      from: fromDate,
      to: toDate,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSection("");
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");

    updateParams({
      section: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      from: undefined,
      to: undefined,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = !!(currentSection || currentMinPrice || currentMaxPrice || currentFrom || currentTo);

  return (
    <div className="space-y-3">
      {/* Sort control - always visible */}
      <div className="flex items-center gap-3">
        <Label htmlFor="sort" className="text-sm font-medium text-slate-700 whitespace-nowrap">
          Sort by:
        </Label>
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger id="sort" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdDesc">Newest first</SelectItem>
            <SelectItem value="createdAsc">Oldest first</SelectItem>
            <SelectItem value="sectionAsc">Section (A–Z)</SelectItem>
            <SelectItem value="gameSoonest">Game date (soonest)</SelectItem>
            <SelectItem value="gameFarthest">Game date (farthest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Collapsible filter panel */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 bg-cyan-600 text-white rounded-full px-2 py-0.5 text-xs">
                  Active
                </span>
              )}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-slate-600 hover:text-slate-900"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </Button>
          )}
        </div>

        <CollapsibleContent className="mt-3">
          <div className="border rounded-lg p-4 bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Section filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-section" className="text-sm font-medium">
                  Section
                </Label>
                <Input
                  id="filter-section"
                  placeholder="e.g., 115, 118"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Min price */}
              <div className="space-y-2">
                <Label htmlFor="filter-min-price" className="text-sm font-medium">
                  Min Price ($)
                </Label>
                <Input
                  id="filter-min-price"
                  type="number"
                  placeholder="e.g., 20"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-white"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max price */}
              <div className="space-y-2">
                <Label htmlFor="filter-max-price" className="text-sm font-medium">
                  Max Price ($)
                </Label>
                <Input
                  id="filter-max-price"
                  type="number"
                  placeholder="e.g., 100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-white"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* From date */}
              <div className="space-y-2">
                <Label htmlFor="filter-from-date" className="text-sm font-medium">
                  Game Date From
                </Label>
                <Input
                  id="filter-from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* To date */}
              <div className="space-y-2">
                <Label htmlFor="filter-to-date" className="text-sm font-medium">
                  Game Date To
                </Label>
                <Input
                  id="filter-to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>

            {/* Apply button */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={applyFilters}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                Apply Filters
              </Button>
              <Button
                variant="outline"
                onClick={clearFilters}
              >
                Clear
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
