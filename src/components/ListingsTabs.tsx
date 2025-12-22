"use client"

import { TabValue } from "@/lib/listings/filterListings"

interface ListingsTabsProps {
  activeTab: TabValue
  onTabChange: (tab: TabValue) => void
  counts?: {
    all: number
    "for-sale": number
    "looking-for": number
    swap: number
  }
}

export function ListingsTabs({ activeTab, onTabChange, counts }: ListingsTabsProps) {
  const tabs: { value: TabValue; label: string }[] = [
    { value: "all", label: "All" },
    { value: "for-sale", label: "For Sale" },
    { value: "looking-for", label: "Looking For" },
    { value: "swap", label: "Swap" },
  ]

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value
          const count = counts?.[tab.value]

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`
                relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${
                  isActive
                    ? "text-cyan-700 border-b-2 border-cyan-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full ${
                    isActive
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
