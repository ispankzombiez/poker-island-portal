import { GameState } from "features/game/types/game";
import {
  getArcadeAttemptsUsedToday,
  getMinigameAttemptsUsedToday,
  getTodayKey,
} from "../poker/session";

export const GOBLIN_INVADERS_RAVEN_COIN_REWARD = 1;

export type GoblinInvadersMode = "reward" | "practice";
export type GoblinInvadersDifficultyName = "easy" | "medium" | "hard";

export type GoblinInvadersDifficulty = {
  name: GoblinInvadersDifficultyName;
  label: string;
  targetScore: number;
  maxWaves: number;
  baseEnemySpeed: number;
  baseEnemyFireMs: number;
  weight: number;
};

const FIRST_WAVE_CLEAR_SCORE = 24 * 10;
const MEDIUM_TARGET_SCORE = FIRST_WAVE_CLEAR_SCORE * 2;
const HARD_TARGET_SCORE = MEDIUM_TARGET_SCORE * 2;

export const GOBLIN_INVADERS_DIFFICULTIES: GoblinInvadersDifficulty[] = [
  {
    name: "easy",
    label: "Easy",
    targetScore: FIRST_WAVE_CLEAR_SCORE,
    maxWaves: 2,
    baseEnemySpeed: 38,
    baseEnemyFireMs: 1700,
    weight: 3,
  },
  {
    name: "medium",
    label: "Medium",
    targetScore: MEDIUM_TARGET_SCORE,
    maxWaves: 3,
    baseEnemySpeed: 52,
    baseEnemyFireMs: 1400,
    weight: 3,
  },
  {
    name: "hard",
    label: "Hard",
    targetScore: HARD_TARGET_SCORE,
    maxWaves: 5,
    baseEnemySpeed: 66,
    baseEnemyFireMs: 1100,
    weight: 2,
  },
];

export const getGoblinInvadersDifficultyFromSeed = (
  seed: number,
): GoblinInvadersDifficulty => {
  const totalWeight = GOBLIN_INVADERS_DIFFICULTIES.reduce(
    (sum, difficulty) => sum + difficulty.weight,
    0,
  );

  const normalizedSeed =
    ((Math.trunc(seed) % totalWeight) + totalWeight) % totalWeight;

  let threshold = 0;

  for (const difficulty of GOBLIN_INVADERS_DIFFICULTIES) {
    threshold += difficulty.weight;

    if (normalizedSeed < threshold) {
      return difficulty;
    }
  }

  return GOBLIN_INVADERS_DIFFICULTIES[GOBLIN_INVADERS_DIFFICULTIES.length - 1];
};

export const getGoblinInvadersDifficulty = (
  now: Date | number = Date.now(),
): GoblinInvadersDifficulty => {
  const todayKey = getTodayKey(now);

  const seed = todayKey.split("").reduce((accumulator, character) => {
    return Math.imul(accumulator, 31) + character.charCodeAt(0);
  }, 97);

  return getGoblinInvadersDifficultyFromSeed(seed >>> 0);
};

export const isGoblinInvadersRewardRunAvailable = ({
  game,
  isVip,
  now = Date.now(),
}: {
  game: GameState;
  isVip: boolean;
  now?: Date | number;
}): boolean => {
  if (isVip) {
    return (
      getMinigameAttemptsUsedToday(game, "goblin-invaders" as any, now) === 0
    );
  }

  return getArcadeAttemptsUsedToday(game, now) === 0;
};
