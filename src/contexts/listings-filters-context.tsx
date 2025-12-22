"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ListingsFilters {
  team: string[];
  zone: string;
  section: string;
  listingType: string;
  from: string; // ISO YYYY-MM-DD
  to: string; // ISO YYYY-MM-DD
  sort: string;
  seatCount: string; // "any" or "1", "2", "3", "4"
}

interface ListingsFiltersContextType {
  filters: ListingsFilters;
  setTeam: (value: string[]) => void;
  setZone: (value:string) => void;
  setSection: (value: string) => void;
  setListingType: (value: string) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setSort: (value: string) => void;
  setSeatCount: (value: string) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  activeFilters: ListingsFilters;
}

const defaultFilters: ListingsFilters = {
  team: [],
  zone: "",
  section: "",
  listingType: "",
  from: "",
  to: "",
  sort: "createdDesc",
  seatCount: "any",
};

const ListingsFiltersContext = createContext<
  ListingsFiltersContextType | undefined
>(undefined);

export function ListingsFiltersProvider({ children }: { children: ReactNode }) {
  // Draft filters (being edited)
  const [filters, setFilters] = useState<ListingsFilters>(defaultFilters);

  // Active filters (applied and used for fetching)
  const [activeFilters, setActiveFilters] = useState<ListingsFilters>(defaultFilters);

  const setTeam = (value: string[]) => {
    setFilters((prev) => ({ ...prev, team: value }));
  };
  
  const setZone = (value: string) => {
    setFilters((prev) => ({ ...prev, zone: value }));
  };

  const setSection = (value: string) => {
    setFilters((prev) => ({ ...prev, section: value }));
  };

  const setListingType = (value: string) => {
    setFilters((prev) => ({ ...prev, listingType: value }));
  };

  const setFromDate = (value: string) => {
    setFilters((prev) => ({ ...prev, from: value }));
  };

  const setToDate = (value: string) => {
    setFilters((prev) => ({ ...prev, to: value }));
  };

  const setSort = (value: string) => {
    const newFilters = { ...filters, sort: value };
    setFilters(newFilters);
    // Sort applies immediately
    setActiveFilters(newFilters);
  };

  const setSeatCount = (value: string) => {
    setFilters((prev) => ({ ...prev, seatCount: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setActiveFilters(defaultFilters);
  };

  const applyFilters = () => {
    setActiveFilters(filters);
  };

  return (
    <ListingsFiltersContext.Provider
      value={{
        filters,
        setTeam,
        setZone,
        setSection,
        setListingType,
        setFromDate,
        setToDate,
        setSort,
        setSeatCount,
        resetFilters,
        applyFilters,
        activeFilters,
      }}
    >
      {children}
    </ListingsFiltersContext.Provider>
  );
}

export function useListingsFilters() {
  const context = useContext(ListingsFiltersContext);
  if (context === undefined) {
    throw new Error(
      "useListingsFilters must be used within a ListingsFiltersProvider"
    );
  }
  return context;
}
