/**
 * Default portal state - completely independent of game
 */

import { PortalGameState } from "../types";

export const DEFAULT_PORTAL_STATE: PortalGameState = {
  inventory: {
    RavenCoin: 0,
  },
  dailyRavenCoinsLastClaimDate: null,
  balance: 0,
  coins: 0,
};
