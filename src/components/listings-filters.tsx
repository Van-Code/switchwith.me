"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, X, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { useMask } from "@react-input/mask";

interface ListingsFiltersProps {
  currentSearch?: string;
  currentSort?: string;
  currentSection?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
  currentFrom?: string; // ISO YYYY-MM-DD
  currentTo?: string;   // ISO YYYY-MM-DD
}

interface Suggestions {
  sections: string[];
  zones: string[];
}

// ISO YYYY-MM-DD -> MM/DD/YYYY
function isoToDisplay(iso?: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
}

// MM/DD/YYYY -> ISO YYYY-MM-DD (returns null if invalid)
function displayToIso(display: string): string | null {
  const trimmed = display.trim();
  if (!trimmed) return null;

  const parts = trimmed.split("/");
  if (parts.length !== 3) return null;

  const [mm, dd, yyyy] = parts.map((part) => part.trim());
  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);

  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
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

  // Filters
  const [section, setSection] = useState(currentSection ?? "");
  const [minPrice, setMinPrice] = useState(currentMinPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? "");

  // Date filter: ISO values for query
  const [fromDate, setFromDate] = useState(currentFrom ?? "");
  const [toDate, setToDate] = useState(currentTo ?? "");

  // Raw text in inputs (MM/DD/YYYY)
  const [fromRaw, setFromRaw] = useState(() =>
    currentFrom ? isoToDisplay(currentFrom) : ""
  );
  const [toRaw, setToRaw] = useState(() =>
    currentTo ? isoToDisplay(currentTo) : ""
  );

  // Date objects for the calendar
  const [fromDateObj, setFromDateObj] = useState<Date | undefined>(() =>
    currentFrom ? new Date(currentFrom) : undefined
  );
  const [toDateObj, setToDateObj] = useState<Date | undefined>(() =>
    currentTo ? new Date(currentTo) : undefined
  );
  
  // Errors
  const [fromError, setFromError] = useState<string | null>(null);
  const [toError, setToError] = useState<string | null>(null);
  
  const fromMaskRef = useMask({
    mask: "__/__/____",
    replacement: { _: /\d/ },
  });

  const toMaskRef = useMask({
    mask: "__/__/____",
    replacement: { _: /\d/ },
  });

  // Keep search in sync with URL
  useEffect(() => {
    setSearchValue(currentSearch ?? "");
  }, [currentSearch]);

  // If fromDate is set and toDate empty, auto fill toDate to match
  useEffect(() => {
    if (fromDate && !toDate) {
      setToDate(fromDate);
      setToRaw(isoToDisplay(fromDate));
      setToError(null);
      setToDateObj(fromDate ? new Date(fromDate) : undefined);
    }
  }, [fromDate, toDate]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Suggestions fetch with debounce
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
        const response = await fetch(
          `/api/listings/suggestions?query=${encodeURIComponent(query)}`
        );
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
// ISO YYYY-MM-DD -> MM/DD/YYYY for initial values
function isoToDisplay(iso?: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
}

// Masked MM/DD/YYYY (with underscores, slashes, etc) -> ISO, or null if invalid
function displayToIso(display: string): string | null {
  const digits = display.replace(/\D/g, ""); // remove non-digits
  if (digits.length !== 8) return null;

  const mm = digits.slice(0, 2);
  const dd = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);

  const month = Number(mm);
  const day = Number(dd);
  const year = Number(yyyy);

  if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const monthStr = String(month).padStart(2, "0");
  const dayStr = String(day).padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
}


  // Blur parsers
  const handleFromBlur = () => {
    if (!fromRaw.trim()) {
      setFromDate("");
      setFromDateObj(undefined);
      setFromError(null);
      return;
    }

    const iso = displayToIso(fromRaw);
    if (!iso) {
      setFromError("Enter a valid date in MM/DD/YYYY.");
      return;
    }

    setFromDate(iso);
    setFromDateObj(new Date(iso));
    setFromError(null);
  };

  const handleToBlur = () => {
    if (!toRaw.trim()) {
      setToDate("");
      setToDateObj(undefined);
      setToError(null);
      return;
    }

    const iso = displayToIso(toRaw);
    if (!iso) {
      setToError("Enter a valid date in MM/DD/YYYY.");
      return;
    }

    if (fromDate && iso < fromDate) {
      setToError("End date cannot be before start date.");
      return;
    }

    setToDate(iso);
    setToDateObj(new Date(iso));
    setToError(null);
  };

  const applyFilters = () => {
    updateParams({
      section: section,
      minPrice: minPrice,
      maxPrice: maxPrice,
      from: fromDate || undefined,
      to: toDate || undefined,
    });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    setSection("");
    setMinPrice("");
    setMaxPrice("");
    setFromDate("");
    setToDate("");
    setFromRaw("");
    setToRaw("");
    setFromDateObj(undefined);
    setToDateObj(undefined);
    setFromError(null);
    setToError(null);

    updateParams({
      search: undefined,
      section: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      from: undefined,
      to: undefined,
    });
  };

  const hasActiveFilters = !!(
    currentSearch ||
    currentSection ||
    currentMinPrice ||
    currentMaxPrice ||
    currentFrom ||
    currentTo
  );
  const hasSuggestions =
    suggestions.sections.length > 0 || suggestions.zones.length > 0;

  return (
    <Card className="overflow-hidden border-2 border-cyan-200 shadow-lg bg-gradient-to-br from-cyan-50 via-white to-orange-50">
      <CardHeader className="pb-3 pt-4 px-4 border-b border-cyan-100 bg-gradient-to-r from-cyan-100 to-cyan-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-bold text-cyan-900">Filter & Search</h2>
          </div>
        </div>
        <p className="text-xs text-cyan-700 mt-1">Narrow down your perfect seat</p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label
            htmlFor="search-input"
            className="text-sm font-semibold text-slate-700 flex items-center gap-1"
          >
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

            {isLoadingSuggestions && showSuggestions && (
              <div className="absolute top-full mt-1 w-full bg-white border border-cyan-200 rounded-md shadow-lg z-50 p-3 text-center text-xs text-slate-500">
                Loading suggestions...
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-orange-200" />

        {/* Section filter */}
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

        {/* Price range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Price Range ($)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
              min="0"
              step="0.01"
            />
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

        {/* Game Date Range */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Game Date</Label>
          <div className="grid grid-cols-2 gap-2">
            {/* From */}
            <div className="space-y-1">
              <Label htmlFor="date-from" className="text-xs text-slate-600">
                From
              </Label>
              <div className="flex gap-1">
                <Input
                  ref={fromMaskRef}
                  id="date-from"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/DD/YYYY"
                  value={fromRaw}
                  onChange={(e) => {
                    setFromRaw(e.target.value);
                    if (fromError) setFromError(null);
                  }}
                  onBlur={handleFromBlur}
                  aria-invalid={fromError ? "true" : "false"}
                  aria-describedby={fromError ? "date-from-error" : undefined}
                  className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                />
                 

                <Popover>
                  <PopoverTrigger
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-cyan-200 px-2 text-slate-600 hover:bg-cyan-50"
                    aria-label="Open calendar to pick start date"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDateObj}
                      onSelect={(date) => {
                        if (!date) return;
                        setFromDateObj(date);

                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        const iso = `${year}-${month}-${day}`;
                        const display = `${month}/${day}/${year}`;

                        setFromDate(iso);
                        setFromRaw(display);
                        setFromError(null);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {fromError && (
                <div
                  id="date-from-error"
                  role="alert"
                  className="text-xs text-red-600 mt-0.5"
                >
                  {fromError}
                </div>
              )}
            </div>

            {/* To */}
            <div className="space-y-1">
              <Label htmlFor="date-to" className="text-xs text-slate-600">
                To
              </Label>
              <div className="flex gap-1">
                <Input
                  ref={toMaskRef}
                  id="date-to"
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/DD/YYYY"
                  value={toRaw}
                  onChange={(e) => {
                    setToRaw(e.target.value);
                    if (toError) setToError(null);
                  }}
                  onBlur={handleToBlur}
                  disabled={!fromDate}
                  aria-invalid={toError ? "true" : "false"}
                  aria-describedby={toError ? "date-to-error" : undefined}
                  className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                 

                <Popover>
                  <PopoverTrigger
                    type="button"
                    disabled={!fromDate}
                    className="inline-flex items-center justify-center rounded-md border border-cyan-200 px-2 text-slate-600 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Open calendar to pick end date"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </PopoverTrigger>
                  <PopoverContent className="p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={toDateObj}
                      onSelect={(date) => {
                        if (!date) return;
                        if (fromDateObj && date < fromDateObj) return;

                        setToDateObj(date);

                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, "0");
                        const day = String(date.getDate()).padStart(2, "0");
                        const iso = `${year}-${month}-${day}`;
                        const display = `${month}/${day}/${year}`;

                        setToDate(iso);
                        setToRaw(display);
                        setToError(null);
                      }}
                      disabled={(date) => !fromDateObj || date < fromDateObj}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {toError && (
                <div
                  id="date-to-error"
                  role="alert"
                  className="text-xs text-red-600 mt-0.5"
                >
                  {toError}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Actions */}
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
