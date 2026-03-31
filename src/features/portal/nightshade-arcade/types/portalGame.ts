/**
 * Portal Game Type Definitions
 * Custom items/coupons specific to the Nightshade Arcade portal
 * Keeps portal-specific definitions separate from main game
 */

export type PortalCurrencyName = "RavenCoin";

export type PortalCoupons = "Nightshade Ticket";

export const PORTAL_CURRENCIES: Record<PortalCurrencyName, { description: string }> = {
  RavenCoin: {
    description: "The currency of the Nightshade Arcade. Earned daily and used to purchase items.",
  },
};

export const PORTAL_COUPONS: Record<PortalCoupons, { description: string }> = {
  "Nightshade Ticket": {
    description: "A special ticket earned from the Nightshade Arcade.",
  },
};
