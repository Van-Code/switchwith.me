/**
 * Zone mapping logic for inferring zones from section numbers
 *
 * This file contains the logic to automatically determine the zone
 * of a seat based on its section number, eliminating the need for
 * manual zone input in Have listings.
 */

export interface ZoneMapping {
  pattern: RegExp | ((section: string) => boolean)
  zone: string
}

/**
 * Default zone mappings for common arena layouts
 * These can be customized based on specific venue configurations
 */
const DEFAULT_ZONE_MAPPINGS: ZoneMapping[] = [
  // Lower Bowl sections (typically 100s)
  {
    pattern: /^1[0-2][0-9]$/,
    zone: "Lower Bowl",
  },
  // Upper Bowl sections (typically 200s)
  {
    pattern: /^2[0-2][0-9]$/,
    zone: "Upper Bowl",
  },
  // Club sections (typically 'C' prefix or specific ranges)
  {
    pattern: /^C\d+$/i,
    zone: "Club Level",
  },
  // Suite sections (typically 'S' prefix or specific ranges)
  {
    pattern: /^S\d+$/i,
    zone: "Suite",
  },
  // Floor sections (typically 'FL' or 'F' prefix)
  {
    pattern: /^(FL|F)\d+$/i,
    zone: "Floor",
  },
  // Lower Bowl variations
  {
    pattern: (section: string) => {
      const num = parseInt(section)
      return !isNaN(num) && num >= 100 && num < 130
    },
    zone: "Lower Bowl",
  },
  // Upper Bowl variations
  {
    pattern: (section: string) => {
      const num = parseInt(section)
      return !isNaN(num) && num >= 200 && num < 240
    },
    zone: "Upper Bowl",
  },
]

/**
 * Infers the zone from a section number/code
 *
 * @param section - The section number or code (e.g., "101", "C12", "FL3")
 * @returns The inferred zone name, or "Unknown" if no mapping found
 */
export function inferZoneFromSection(section: string): string {
  if (!section || typeof section !== 'string') {
    return "Unknown"
  }

  const trimmedSection = section.trim()

  for (const mapping of DEFAULT_ZONE_MAPPINGS) {
    if (typeof mapping.pattern === 'function') {
      if (mapping.pattern(trimmedSection)) {
        return mapping.zone
      }
    } else {
      if (mapping.pattern.test(trimmedSection)) {
        return mapping.zone
      }
    }
  }

  // If no mapping found, return Unknown
  return "Unknown"
}

/**
 * Validates if a section has a known zone mapping
 *
 * @param section - The section number or code
 * @returns true if zone can be inferred, false otherwise
 */
export function hasKnownZone(section: string): boolean {
  return inferZoneFromSection(section) !== "Unknown"
}
