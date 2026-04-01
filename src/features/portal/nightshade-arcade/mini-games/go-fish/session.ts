import { GameState } from "features/game/types/game";
import {
  getArcadeAttemptsUsedToday,
  getMinigameAttemptsUsedToday,
} from "../poker/session";

export const GO_FISH_RAVEN_COIN_REWARD = 1;

export type GoFishMode = "reward" | "practice";

export const isGoFishRewardRunAvailable = ({
  game,
  isVip,
  now = Date.now(),
}: {
  game: GameState;
  isVip: boolean;
  now?: Date | number;
}): boolean => {
  if (isVip) {
    return getMinigameAttemptsUsedToday(game, "gofish", now) === 0;
  }

  return getArcadeAttemptsUsedToday(game, now) === 0;
};
