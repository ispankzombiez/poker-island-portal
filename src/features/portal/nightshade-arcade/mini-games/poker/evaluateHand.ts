/**
 * Poker Hand Evaluation Logic
 * Evaluates 5-card poker hands and determines winners
 */

import {
  Card,
  CardRank,
  CardSuit,
  EvaluatedHand,
  HandRanking,
} from "./types";

// Rank values for comparison
const RANK_VALUES: Record<CardRank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

const RANK_NAMES: Record<CardRank, string> = {
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  "10": "10",
  J: "Jack",
  Q: "Queen",
  K: "King",
  A: "Ace",
};

const HAND_RANKING_NAMES: Record<HandRanking, string> = {
  [HandRanking.HighCard]: "High Card",
  [HandRanking.OnePair]: "One Pair",
  [HandRanking.TwoPair]: "Two Pair",
  [HandRanking.ThreeOfAKind]: "Three of a Kind",
  [HandRanking.Straight]: "Straight",
  [HandRanking.Flush]: "Flush",
  [HandRanking.FullHouse]: "Full House",
  [HandRanking.FourOfAKind]: "Four of a Kind",
  [HandRanking.StraightFlush]: "Straight Flush",
  [HandRanking.RoyalFlush]: "Royal Flush",
};

/**
 * Get the best 5-card hand from 7 cards (5 community + 2 hole cards)
 */
export function getBestHand(cards: Card[]): Card[] {
  if (cards.length < 5) {
    return cards;
  }

  // Generate all 5-card combinations from the 7 cards
  const combinations = generateCombinations(cards, 5);
  
  let bestHand = combinations[0];
  let bestRanking = evaluateHand(bestHand).ranking;

  for (let i = 1; i < combinations.length; i++) {
    const ranking = evaluateHand(combinations[i]).ranking;
    if (ranking > bestRanking) {
      bestHand = combinations[i];
      bestRanking = ranking;
    }
  }

  return bestHand;
}

/**
 * Evaluate a 5-card hand and return its ranking
 */
export function evaluateHand(cards: Card[]): EvaluatedHand {
  if (cards.length !== 5) {
    throw new Error("Hand must contain exactly 5 cards");
  }

  // Check for each hand ranking from highest to lowest
  if (isRoyalFlush(cards)) {
    return {
      ranking: HandRanking.RoyalFlush,
      rankingName: HAND_RANKING_NAMES[HandRanking.RoyalFlush],
      cards,
      kickers: [],
    };
  }

  if (isStraightFlush(cards)) {
    return {
      ranking: HandRanking.StraightFlush,
      rankingName: HAND_RANKING_NAMES[HandRanking.StraightFlush],
      cards,
      kickers: [],
    };
  }

  const fourOfAKind = isFourOfAKind(cards);
  if (fourOfAKind) {
    return {
      ranking: HandRanking.FourOfAKind,
      rankingName: HAND_RANKING_NAMES[HandRanking.FourOfAKind],
      cards: fourOfAKind.quads,
      kickers: fourOfAKind.kicker,
    };
  }

  const fullHouse = isFullHouse(cards);
  if (fullHouse) {
    return {
      ranking: HandRanking.FullHouse,
      rankingName: HAND_RANKING_NAMES[HandRanking.FullHouse],
      cards: [...fullHouse.trips, ...fullHouse.pair],
      kickers: [],
    };
  }

  if (isFlush(cards)) {
    return {
      ranking: HandRanking.Flush,
      rankingName: HAND_RANKING_NAMES[HandRanking.Flush],
      cards,
      kickers: [],
    };
  }

  if (isStraight(cards)) {
    return {
      ranking: HandRanking.Straight,
      rankingName: HAND_RANKING_NAMES[HandRanking.Straight],
      cards,
      kickers: [],
    };
  }

  const threeOfAKind = isThreeOfAKind(cards);
  if (threeOfAKind) {
    return {
      ranking: HandRanking.ThreeOfAKind,
      rankingName: HAND_RANKING_NAMES[HandRanking.ThreeOfAKind],
      cards: threeOfAKind.trips,
      kickers: threeOfAKind.kickers,
    };
  }

  const twoPair = isTwoPair(cards);
  if (twoPair) {
    return {
      ranking: HandRanking.TwoPair,
      rankingName: HAND_RANKING_NAMES[HandRanking.TwoPair],
      cards: [...twoPair.pair1, ...twoPair.pair2],
      kickers: twoPair.kicker,
    };
  }

  const onePair = isOnePair(cards);
  if (onePair) {
    return {
      ranking: HandRanking.OnePair,
      rankingName: HAND_RANKING_NAMES[HandRanking.OnePair],
      cards: onePair.pair,
      kickers: onePair.kickers,
    };
  }

  return {
    ranking: HandRanking.HighCard,
    rankingName: HAND_RANKING_NAMES[HandRanking.HighCard],
    cards,
    kickers: [],
  };
}

// Helper functions for checking hand types
function isRoyalFlush(cards: Card[]): boolean {
  if (!isFlush(cards) || !isStraight(cards)) return false;
  
  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => b - a);
  return values[0] === 14; // Ace high
}

function isStraightFlush(cards: Card[]): boolean {
  return isFlush(cards) && isStraight(cards);
}

function isFourOfAKind(cards: Card[]): { quads: Card[]; kicker: Card[] } | null {
  const grouped = groupByRank(cards);
  for (const group of Object.values(grouped)) {
    if (group.length === 4) {
      const kicker = cards.find((c) => !group.includes(c));
      return { quads: group, kicker: kicker ? [kicker] : [] };
    }
  }
  return null;
}

function isFullHouse(cards: Card[]): { trips: Card[]; pair: Card[] } | null {
  const grouped = groupByRank(cards);
  let trips: Card[] = [];
  let pair: Card[] = [];

  for (const group of Object.values(grouped)) {
    if (group.length === 3) trips = group;
    if (group.length === 2) pair = group;
  }

  return trips.length > 0 && pair.length > 0 ? { trips, pair } : null;
}

function isFlush(cards: Card[]): boolean {
  const suits = cards.map((c) => c.suit);
  return new Set(suits).size === 1;
}

function isStraight(cards: Card[]): boolean {
  const values = cards.map((c) => RANK_VALUES[c.rank]).sort((a, b) => a - b);

  // Check for regular straight
  if (values[4] - values[0] === 4 && new Set(values).size === 5) {
    return true;
  }

  // Check for Ace-low straight (A-2-3-4-5)
  if (
    values[0] === 2 &&
    values[1] === 3 &&
    values[2] === 4 &&
    values[3] === 5 &&
    values[4] === 14
  ) {
    return true;
  }

  return false;
}

function isThreeOfAKind(
  cards: Card[]
): { trips: Card[]; kickers: Card[] } | null {
  const grouped = groupByRank(cards);
  for (const group of Object.values(grouped)) {
    if (group.length === 3) {
      const kickers = cards.filter((c) => !group.includes(c));
      return { trips: group, kickers };
    }
  }
  return null;
}

function isTwoPair(cards: Card[]): { pair1: Card[]; pair2: Card[]; kicker: Card[] } | null {
  const grouped = groupByRank(cards);
  const pairs: Card[][] = [];

  for (const group of Object.values(grouped)) {
    if (group.length === 2) pairs.push(group);
  }

  if (pairs.length === 2) {
    const kicker = cards.find((c) => !pairs[0].includes(c) && !pairs[1].includes(c));
    const kickerArray: Card[] = kicker ? [kicker] : [];
    return {
      pair1: pairs[0],
      pair2: pairs[1],
      kicker: kickerArray,
    };
  }

  return null;
}

function isOnePair(cards: Card[]): { pair: Card[]; kickers: Card[] } | null {
  const grouped = groupByRank(cards);
  for (const group of Object.values(grouped)) {
    if (group.length === 2) {
      const kickers = cards.filter((c) => !group.includes(c));
      return { pair: group, kickers };
    }
  }
  return null;
}

function groupByRank(cards: Card[]): Record<CardRank, Card[]> {
  const grouped: Record<CardRank, Card[]> = {} as Record<CardRank, Card[]>;

  for (const card of cards) {
    if (!grouped[card.rank]) {
      grouped[card.rank] = [];
    }
    grouped[card.rank].push(card);
  }

  return grouped;
}

function generateCombinations(arr: Card[], size: number): Card[][] {
  const result: Card[][] = [];

  function backtrack(start: number, current: Card[]) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return result;
}

/**
 * Compare two hands and return winner
 * Returns: 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1: Card[], hand2: Card[]): number {
  const eval1 = evaluateHand(hand1);
  const eval2 = evaluateHand(hand2);

  if (eval1.ranking > eval2.ranking) return 1;
  if (eval1.ranking < eval2.ranking) return -1;

  // Same ranking - compare by cards and kickers
  return 0; // For now, return tie (can be enhanced with tiebreaker logic)
}
