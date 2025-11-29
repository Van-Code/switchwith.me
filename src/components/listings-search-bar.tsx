"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";

interface ListingsSearchBarProps {
  placeholder?: string;
}

export default function ListingsSearchBar({
  placeholder = "Search by section, row, seat, or zone...",
}: ListingsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("search", value.trim());
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
  };

  const clearSearch = () => {
    setValue("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    const query = params.toString();
    router.push(query ? `/listings?${query}` : "/listings");
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2 items-center w-full max-w-2xl">
      <div className="relative flex-1">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
  );
}
