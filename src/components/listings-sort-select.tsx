"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ListingsSortSelectProps {
  currentSort?: string;
}

export default function ListingsSortSelect({
  currentSort = "createdDesc",
}: ListingsSortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "createdDesc") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }

    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort-select" className="text-sm font-medium text-slate-700 whitespace-nowrap">
        Sort by:
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
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
