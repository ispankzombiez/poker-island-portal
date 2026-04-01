import { GameState } from "features/game/types/game";
import { MinigameName } from "features/game/types/minigames";

export const NIGHTSHADE_ARCADE_MINIGAMES: MinigameName[] = [
  "poker",
  "blackjack",
  "gofish",
  "roulette",
  "slots",
];

export const POKER_STARTING_CHIPS = 100;
export const POKER_MAX_HANDS = 5;
export const POKER_RAVEN_COIN_REWARD = 1;

export type PokerMode = "reward" | "practice";
export type PokerDifficultyName = "easy" | "medium" | "hard" | "expert";

export type PokerDifficulty = {
  name: PokerDifficultyName;
  label: string;
  targetChips: number;
  weight: number;
};

export const POKER_DIFFICULTIES: PokerDifficulty[] = [
  { name: "easy", label: "Easy", targetChips: 200, weight: 2 },
  { name: "medium", label: "Medium", targetChips: 500, weight: 3 },
  { name: "hard", label: "Hard", targetChips: 750, weight: 3 },
  { name: "expert", label: "Expert", targetChips: 1000, weight: 2 },
];

export const getTodayKey = (now: Date | number = Date.now()) =>
  new Date(now).toISOString().slice(0, 10);

export const getPokerDifficultyFromSeed = (seed: number): PokerDifficulty => {
  const totalWeight = POKER_DIFFICULTIES.reduce(
    (total, difficulty) => total + difficulty.weight,
    0,
  );
  const normalizedSeed =
    ((Math.trunc(seed) % totalWeight) + totalWeight) % totalWeight;

  let threshold = 0;

  for (const difficulty of POKER_DIFFICULTIES) {
    threshold += difficulty.weight;

    if (normalizedSeed < threshold) {
      return difficulty;
    }
  }

  return POKER_DIFFICULTIES[POKER_DIFFICULTIES.length - 1];
};

export const getPokerDifficulty = (
  now: Date | number = Date.now(),
): PokerDifficulty => {
  const todayKey = getTodayKey(now);
  const seed = todayKey.split("").reduce((accumulator, character) => {
    return Math.imul(accumulator, 31) + character.charCodeAt(0);
  }, 7);

  return getPokerDifficultyFromSeed(seed >>> 0);
};

export const getArcadeAttemptsUsedToday = (
  game: GameState,
  now: Date | number = Date.now(),
) => {
  const todayKey = getTodayKey(now);

  return NIGHTSHADE_ARCADE_MINIGAMES.reduce((total, minigame) => {
    return (
      total +
      (game.minigames.games[minigame]?.history?.[todayKey]?.attempts ?? 0)
    );
  }, 0);
};

export const getMinigameAttemptsUsedToday = (
  game: GameState,
  minigame: MinigameName,
  now: Date | number = Date.now(),
) => {
  const todayKey = getTodayKey(now);

  return game.minigames.games[minigame]?.history?.[todayKey]?.attempts ?? 0;
};

export const getPokerMode = ({
  game,
  isVip,
  now = Date.now(),
}: {
  game: GameState;
  isVip: boolean;
  now?: Date | number;
}): PokerMode => {
  if (isVip) {
    return getMinigameAttemptsUsedToday(game, "poker", now) === 0
      ? "reward"
      : "practice";
  }

  return getArcadeAttemptsUsedToday(game, now) === 0 ? "reward" : "practice";
};

export const isRewardRunAvailable = ({
  game,
  isVip,
  now = Date.now(),
}: {
  game: GameState;
  isVip: boolean;
  now?: Date | number;
}): boolean => {
  if (isVip) {
    return getMinigameAttemptsUsedToday(game, "poker", now) === 0;
  }

  return getArcadeAttemptsUsedToday(game, now) === 0;
};
