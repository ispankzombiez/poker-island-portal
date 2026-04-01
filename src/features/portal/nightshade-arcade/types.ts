/**
 * Nightshade Arcade portal types
 */

import { GameState } from "features/game/types/game";

export type PortalGameState = GameState;

export type MinigameName =
  | "poker"
  | "slots"
  | "blackjack"
  | "roulette"
  | "gofish"
  | "uno";

export interface Coordinates {
  x: number;
  y: number;
}
