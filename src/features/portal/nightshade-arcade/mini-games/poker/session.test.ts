import { TEST_FARM } from "features/game/lib/constants";
import { GameState } from "features/game/types/game";

import {
  getArcadeAttemptsUsedToday,
  getPokerDifficulty,
  getPokerDifficultyFromSeed,
  getMinigameAttemptsUsedToday,
  getPokerMode,
} from "./session";

const todayKey = "2026-03-31";
const now = new Date(`${todayKey}T12:00:00.000Z`);

const withAttempts = (
  updates: Partial<
    Record<"poker" | "blackjack" | "roulette" | "slots", number>
  >,
) => {
  const game: GameState = {
    ...TEST_FARM,
    minigames: {
      ...TEST_FARM.minigames,
      games: {
        ...TEST_FARM.minigames.games,
      },
      prizes: {
        ...TEST_FARM.minigames.prizes,
      },
    },
  };

  Object.entries(updates).forEach(([name, attempts]) => {
    game.minigames.games[name as "poker"] = {
      highscore: 0,
      history: {
        [todayKey]: {
          attempts: attempts ?? 0,
          highscore: 0,
        },
      },
    };
  });

  return game;
};

describe("nightshade poker session rules", () => {
  it("counts attempts across all Nightshade arcade games", () => {
    const game = withAttempts({ poker: 1, blackjack: 2, slots: 1 });

    expect(getArcadeAttemptsUsedToday(game, now)).toBe(4);
    expect(getMinigameAttemptsUsedToday(game, "poker", now)).toBe(1);
  });

  it("gives VIP players one reward run per game", () => {
    const untouchedPoker = withAttempts({ blackjack: 1 });
    const usedPoker = withAttempts({ poker: 1, blackjack: 1 });

    expect(getPokerMode({ game: untouchedPoker, isVip: true, now })).toBe(
      "reward",
    );
    expect(getPokerMode({ game: usedPoker, isVip: true, now })).toBe(
      "practice",
    );
  });

  it("gives non-VIP players one reward run across the whole arcade", () => {
    const noAttempts = withAttempts({});
    const usedAnotherGame = withAttempts({ roulette: 1 });

    expect(getPokerMode({ game: noAttempts, isVip: false, now })).toBe(
      "reward",
    );
    expect(getPokerMode({ game: usedAnotherGame, isVip: false, now })).toBe(
      "practice",
    );
  });

  it("selects weighted poker difficulties with middle options appearing more often", () => {
    expect(getPokerDifficultyFromSeed(0).name).toBe("easy");
    expect(getPokerDifficultyFromSeed(1).name).toBe("easy");
    expect(getPokerDifficultyFromSeed(2).name).toBe("medium");
    expect(getPokerDifficultyFromSeed(4).name).toBe("medium");
    expect(getPokerDifficultyFromSeed(5).name).toBe("hard");
    expect(getPokerDifficultyFromSeed(7).name).toBe("hard");
    expect(getPokerDifficultyFromSeed(8).name).toBe("expert");
    expect(getPokerDifficultyFromSeed(9).name).toBe("expert");
  });

  it("uses the same poker difficulty across the same UTC day", () => {
    const midday = getPokerDifficulty(new Date("2026-03-31T12:00:00.000Z"));
    const evening = getPokerDifficulty(new Date("2026-03-31T23:59:59.000Z"));

    expect(midday).toEqual(evening);
  });
});
