"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface ListingsFiltersProps {
  currentSearch?: string;
  currentSort?: string;
  currentSection?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentFrom?: string;
  currentTo?: string;
}

interface Suggestions {
  sections: string[];
  zones: string[];
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

  // Search state
  const [searchValue, setSearchValue] = useState(currentSearch ?? "");
  const [suggestions, setSuggestions] = useState<Suggestions>({ sections: [], zones: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [section, setSection] = useState(currentSection ?? "");
  const [minPrice, setMinPrice] = useState(currentMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? "");
  const [fromDate, setFromDate] = useState(currentFrom ?? "");
  const [toDate, setToDate] = useState(currentTo ?? "");

  // Update search value when prop changes
  useEffect(() => {
    setSearchValue(currentSearch ?? "");
  }, [currentSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const query = searchValue.trim();
    if (query.length < 2) {
      setSuggestions({ sections: [], zones: [] });
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`/api/listings/suggestions?query=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue]);

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

  // Handle search submit
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchValue.trim() });
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchValue(suggestion);
    updateParams({ search: suggestion });
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchValue("");
    updateParams({ search: undefined });
    setShowSuggestions(false);
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

  // Clear all filters (including search)
  const clearAllFilters = () => {
    setSearchValue("");
    setSection("");
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");

    updateParams({
      search: undefined,
      section: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      from: undefined,
      to: undefined,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = !!(currentSearch || currentSection || currentMinPrice || currentMaxPrice || currentFrom || currentTo);
  const hasSuggestions = suggestions.sections.length > 0 || suggestions.zones.length > 0;

  return (
    <Card className="overflow-hidden border-2 border-cyan-200 shadow-lg bg-gradient-to-br from-cyan-50 via-white to-orange-50">
      <CardHeader className="pb-3 pt-4 px-4 border-b border-cyan-100 bg-gradient-to-r from-cyan-100 to-cyan-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-bold text-cyan-900">Filter & Search</h2>
          </div>
          {hasActiveFilters && (
            <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">
              Active
            </Badge>
          )}
        </div>
        <p className="text-xs text-cyan-700 mt-1">Narrow down your perfect seat</p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search Section */}
        <div className="space-y-2">
          <Label htmlFor="search-input" className="text-sm font-semibold text-slate-700 flex items-center gap-1">
            <Search className="h-3.5 w-3.5 text-cyan-600" />
            Search Listings
          </Label>
          <div ref={searchWrapperRef} className="relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Input
                  id="search-input"
                  placeholder="Section, row, seat, zone..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    if (hasSuggestions && searchValue.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pr-8 text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                />
                {currentSearch && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && hasSuggestions && (
              <div className="absolute top-full mt-1 w-full bg-white border border-cyan-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {suggestions.sections.length > 0 && (
                  <div className="p-1.5">
                    <div className="text-xs font-semibold text-cyan-700 px-2 py-1 uppercase">
                      Sections
                    </div>
                    {suggestions.sections.map((sec, index) => (
                      <button
                        key={`section-${index}`}
                        type="button"
                        onClick={() => selectSuggestion(sec)}
                        className="w-full text-left px-2 py-1.5 hover:bg-cyan-50 rounded text-slate-900 text-sm"
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.zones.length > 0 && (
                  <div className="p-1.5 border-t border-slate-100">
                    <div className="text-xs font-semibold text-cyan-700 px-2 py-1 uppercase">
                      Zones
                    </div>
                    {suggestions.zones.map((zone, index) => (
                      <button
                        key={`zone-${index}`}
                        type="button"
                        onClick={() => selectSuggestion(zone)}
                        className="w-full text-left px-2 py-1.5 hover:bg-cyan-50 rounded text-slate-900 text-sm"
                      >
                        {zone}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Loading indicator */}
            {isLoadingSuggestions && showSuggestions && (
              <div className="absolute top-full mt-1 w-full bg-white border border-cyan-200 rounded-md shadow-lg z-50 p-3 text-center text-xs text-slate-500">
                Loading suggestions...
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-orange-200"></div>

        {/* Section Filter */}
        <div className="space-y-2">
          <Label htmlFor="filter-section" className="text-sm font-semibold text-slate-700">
            Section
          </Label>
          <Input
            id="filter-section"
            placeholder="e.g., 115, 118"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
          />
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Game Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Game Date</Label>
          <div className="space-y-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
              placeholder="From"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
              placeholder="To"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <Button
            onClick={applyFilters}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-md text-sm"
          >
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 text-sm"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
