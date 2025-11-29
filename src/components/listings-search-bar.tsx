"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface ListingsSearchBarProps {
  placeholder?: string;
}

interface Suggestions {
  sections: string[];
  zones: string[];
}

export default function ListingsSearchBar({
  placeholder = "Search by section, row, seat, or zone...",
}: ListingsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);
  const [suggestions, setSuggestions] = useState<Suggestions>({ sections: [], zones: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
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

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions({ sections: [], zones: [] });
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [value]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitSearch(value.trim());
  };

  const submitSearch = (searchValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion: string) => {
    setValue(suggestion);
    submitSearch(suggestion);
  };

  const hasSuggestions = suggestions.sections.length > 0 || suggestions.zones.length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl">
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => {
              if (hasSuggestions && value.trim().length >= 2) {
                setShowSuggestions(true);
              }
            }}
            className="pr-10"
          />
          {currentSearch && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="default" className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && hasSuggestions && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.sections.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">
                Sections
              </div>
              {suggestions.sections.map((section, index) => (
                <button
                  key={`section-${index}`}
                  type="button"
                  onClick={() => selectSuggestion(section)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-50 rounded text-slate-900 text-sm"
                >
                  Section {section}
                </button>
              ))}
            </div>
          )}

          {suggestions.zones.length > 0 && (
            <div className="p-2 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-500 px-2 py-1 uppercase">
                Zones
              </div>
              {suggestions.zones.map((zone, index) => (
                <button
                  key={`zone-${index}`}
                  type="button"
                  onClick={() => selectSuggestion(zone)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-50 rounded text-slate-900 text-sm"
                >
                  {zone}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && showSuggestions && (
        <div className="absolute top-full mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4 text-center text-sm text-slate-500">
          Loading suggestions...
        </div>
      )}
    </div>
  );
}
