"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X, SlidersHorizontal, Calendar as CalendarIcon } from "lucide-react";
import { useMask } from "@react-input/mask";
import { useListingsFilters } from "@/contexts/listings-filters-context";
import { TEAMS } from "@/config/teams";

// ISO YYYY-MM-DD -> MM/DD/YYYY
function isoToDisplay(iso?: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${month.padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
}

// MM/DD/YYYY -> ISO YYYY-MM-DD (returns null if invalid)
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

export default function ListingsFilters() {
  const {
    filters,
    setTeam,
    setSection,
    setMinPrice,
    setMaxPrice,
    setFromDate,
    setToDate,
    resetFilters,
    applyFilters,
    activeFilters,
  } = useListingsFilters();

  // Raw text in inputs (MM/DD/YYYY)
  const [fromRaw, setFromRaw] = useState(() =>
    filters.from ? isoToDisplay(filters.from) : ""
  );
  const [toRaw, setToRaw] = useState(() =>
    filters.to ? isoToDisplay(filters.to) : ""
  );

  // Date objects for the calendar
  const [fromDateObj, setFromDateObj] = useState<Date | undefined>(() =>
    filters.from ? new Date(filters.from) : undefined
  );
  const [toDateObj, setToDateObj] = useState<Date | undefined>(() =>
    filters.to ? new Date(filters.to) : undefined
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

  // If fromDate is set and toDate empty, auto fill toDate to match
  useEffect(() => {
    if (filters.from && !filters.to) {
      setToDate(filters.from);
      setToRaw(isoToDisplay(filters.from));
      setToError(null);
      setToDateObj(filters.from ? new Date(filters.from) : undefined);
    }
  }, [filters.from, filters.to, setToDate]);

  const handleTeamToggle = (teamSlug: string) => {
    const newTeams = filters.team.includes(teamSlug)
      ? filters.team.filter((t) => t !== teamSlug)
      : [...filters.team, teamSlug];
    setTeam(newTeams);
  };

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

    if (filters.from && iso < filters.from) {
      setToError("End date cannot be before start date.");
      return;
    }

    setToDate(iso);
    setToDateObj(new Date(iso));
    setToError(null);
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const handleClearAllFilters = () => {
    setFromRaw("");
    setToRaw("");
    setFromDateObj(undefined);
    setToDateObj(undefined);
    setFromError(null);
    setToError(null);
    resetFilters();
  };

  const hasActiveFilters = !!(
    activeFilters.team.length > 0 ||
    activeFilters.section ||
    activeFilters.minPrice ||
    activeFilters.maxPrice ||
    activeFilters.from ||
    activeFilters.to
  );

  return (
    <Card className="overflow-hidden border-2 border-cyan-200 shadow-lg bg-gradient-to-br from-cyan-50 via-white to-orange-50">
      <CardHeader className="pb-3 pt-4 px-4 border-b border-cyan-100 bg-gradient-to-r from-cyan-100 to-cyan-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-cyan-700" />
            <h2 className="text-lg font-bold text-cyan-900">Filter Listings</h2>
          </div>
        </div>
        <p className="text-xs text-cyan-700 mt-1">Narrow down your perfect seat</p>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Team filter */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Teams</Label>
          <div className="space-y-2">
            {TEAMS.map((team) => (
              <div key={team.slug} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`team-${team.slug}`}
                  checked={filters.team.includes(team.slug)}
                  onChange={() => handleTeamToggle(team.slug)}
                  className="h-4 w-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Label
                  htmlFor={`team-${team.slug}`}
                  className="font-normal text-sm cursor-pointer"
                >
                  {team.name}
                </Label>
              </div>
            ))}
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
            value={filters.section}
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
              value={filters.minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
              min="0"
              step="0.01"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
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
                  disabled={!filters.from}
                  aria-invalid={toError ? "true" : "false"}
                  aria-describedby={toError ? "date-to-error" : undefined}
                  className="text-sm border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />

                <Popover>
                  <PopoverTrigger
                    type="button"
                    disabled={!filters.from}
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
            onClick={handleApplyFilters}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-md text-sm"
          >
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={handleClearAllFilters}
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
