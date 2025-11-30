"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useListingsFilters } from "@/contexts/listings-filters-context";

export default function ListingsSortSelect() {
  const { activeFilters, setSort } = useListingsFilters();

  const handleSortChange = (value: string) => {
    setSort(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">
        Sort by:
      </Label>
      <Select value={activeFilters.sort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select" className="w-[180px] border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400">
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
  );
}
