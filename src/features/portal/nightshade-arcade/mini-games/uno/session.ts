import { GameState } from "features/game/types/game";
import {
  getArcadeAttemptsUsedToday,
  getMinigameAttemptsUsedToday,
} from "../poker/session";

export const UNO_RAVEN_COIN_REWARD = 1;

export type UnoMode = "reward" | "practice";

export const isUnoRewardRunAvailable = ({
  game,
  isVip,
  now = Date.now(),
}: {
  game: GameState;
  isVip: boolean;
  now?: Date | number;
}): boolean => {
  if (isVip) {
    return getMinigameAttemptsUsedToday(game, "uno", now) === 0;
  }

  return getArcadeAttemptsUsedToday(game, now) === 0;
};
