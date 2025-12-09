/**
 * Feature flag utilities
 *
 * Controls which features are enabled/disabled via environment variables
 */

export const features = {
  payToChat: process.env.NEXT_PUBLIC_FEATURE_PAY_TO_CHAT_ENABLED === "true",
  seatMap: process.env.NEXT_PUBLIC_FEATURE_SEAT_MAP_ENABLED === "true",
  relatedListings: process.env.NEXT_PUBLIC_FEATURE_RELATED_LISTINGS_EANBLED === "true",
  boostListings: process.env.NEXT_PUBLIC_FEATURE_BOOST_LISTINGS_ENABLED === "true",
  flagUser: process.env.NEXT_PUBLIC_FEATURE_FLAG_USER_ENABLED === "true",

}

// Helper functions for feature checks
export const isPayToChatEnabled = (): boolean => features.payToChat
export const isSeatMapEnabled = (): boolean => features.seatMap
export const isRelatedListingsEnabled = (): boolean => features.relatedListings
export const isBoostEnabled = (): boolean => features.boostListings
export const isFlagUserEnabled = (): boolean => features.flagUser