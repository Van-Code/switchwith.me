"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ListingsFilters {
  team: string[];
  zone: string;
  section: string;
  minPrice: string;
  maxPrice: string;
  from: string; // ISO YYYY-MM-DD
  to: string; // ISO YYYY-MM-DD
  sort: string;
}

interface ListingsFiltersContextType {
  filters: ListingsFilters;
  setTeam: (value: string[]) => void;
  setZone: (value:string) => void;
  setSection: (value: string) => void;
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setSort: (value: string) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  activeFilters: ListingsFilters;
}

const defaultFilters: ListingsFilters = {
  team: [],
  zone: "",
  section: "",
  minPrice: "",
  maxPrice: "",
  from: "",
  to: "",
  sort: "createdDesc",
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

  const setMinPrice = (value: string) => {
    setFilters((prev) => ({ ...prev, minPrice: value }));
  };

  const setMaxPrice = (value: string) => {
    setFilters((prev) => ({ ...prev, maxPrice: value }));
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
        setMinPrice,
        setMaxPrice,
        setFromDate,
        setToDate,
        setSort,
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
