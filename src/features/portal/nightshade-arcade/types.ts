/**
 * Portal-specific types independent of the main game
 */

export interface PortalInventory {
  RavenCoin?: number;
  [itemName: string]: number | undefined;
}

export interface PortalGameState {
  // Portal-specific state only
  inventory: PortalInventory;
  dailyRavenCoinsLastClaimDate?: string | null;
  
  // Required for HUD display
  balance: number;
  coins: number;
}

export type MinigameName = "poker" | "slots" | "blackjack" | "roulette";

export interface Coordinates {
  x: number;
  y: number;
}
