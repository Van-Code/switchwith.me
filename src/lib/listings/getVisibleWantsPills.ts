/**
 * Truncates wants pills to show max 2 visible items plus overflow count
 */

export interface VisibleWantsPills {
  visible: string[]
  overflowCount: number
}

/**
 * Returns the first 2 wants pills and a count of remaining items
 * @param wants - Array of want items (zones or sections)
 * @returns Object with visible items and overflow count
 */
export function getVisibleWantsPills(wants: string[]): VisibleWantsPills {
  const MAX_VISIBLE = 2

  if (wants.length <= MAX_VISIBLE) {
    return {
      visible: wants,
      overflowCount: 0,
    }
  }

  return {
    visible: wants.slice(0, MAX_VISIBLE),
    overflowCount: wants.length - MAX_VISIBLE,
  }
}
