import { evaluateHand, compareHands } from "./evaluateHand";
import { Card, HandRanking } from "./types";

describe("Poker Hand Evaluation", () => {
  describe("evaluateHand", () => {
    it("evaluates a pair correctly", () => {
      const hand: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "J", suit: "Radish" },
        { rank: "10", suit: "Kale" },
      ];
      const result = evaluateHand(hand);
      expect(result.ranking).toBe(HandRanking.OnePair);
    });

    it("evaluates a flush correctly", () => {
      const hand: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "K", suit: "Kale" },
        { rank: "Q", suit: "Kale" },
        { rank: "J", suit: "Kale" },
        { rank: "9", suit: "Kale" },
      ];
      const result = evaluateHand(hand);
      expect(result.ranking).toBe(HandRanking.Flush);
    });

    it("evaluates a straight correctly", () => {
      const hand: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "Q", suit: "Barley" },
        { rank: "J", suit: "Wheat" },
        { rank: "10", suit: "Radish" },
        { rank: "9", suit: "Kale" },
      ];
      const result = evaluateHand(hand);
      expect(result.ranking).toBe(HandRanking.Straight);
    });

    it("evaluates a royal flush correctly", () => {
      const hand: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "K", suit: "Kale" },
        { rank: "Q", suit: "Kale" },
        { rank: "J", suit: "Kale" },
        { rank: "10", suit: "Kale" },
      ];
      const result = evaluateHand(hand);
      expect(result.ranking).toBe(HandRanking.RoyalFlush);
    });
  });

  describe("compareHands", () => {
    it("higher pair beats lower pair", () => {
      const pairOfAces: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "J", suit: "Kale" },
      ];
      const pairOfKings: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "A", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "J", suit: "Kale" },
      ];

      expect(compareHands(pairOfAces, pairOfKings)).toBe(1);
      expect(compareHands(pairOfKings, pairOfAces)).toBe(-1);
    });

    it("pair with better kickers wins", () => {
      const pairKingsAceKicker: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "A", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "J", suit: "Kale" },
      ];
      const pairKingsQueenKicker: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "J", suit: "Radish" },
        { rank: "10", suit: "Kale" },
      ];

      expect(compareHands(pairKingsAceKicker, pairKingsQueenKicker)).toBe(1);
      expect(compareHands(pairKingsQueenKicker, pairKingsAceKicker)).toBe(-1);
    });

    it("straight with higher high card wins", () => {
      const straightKingHigh: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "Q", suit: "Barley" },
        { rank: "J", suit: "Wheat" },
        { rank: "10", suit: "Radish" },
        { rank: "9", suit: "Kale" },
      ];
      const straightQueenHigh: Card[] = [
        { rank: "Q", suit: "Kale" },
        { rank: "J", suit: "Barley" },
        { rank: "10", suit: "Wheat" },
        { rank: "9", suit: "Radish" },
        { rank: "8", suit: "Kale" },
      ];

      expect(compareHands(straightKingHigh, straightQueenHigh)).toBe(1);
      expect(compareHands(straightQueenHigh, straightKingHigh)).toBe(-1);
    });

    it("two pair with higher high pair wins", () => {
      const twoAcesKings: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "K", suit: "Radish" },
        { rank: "Q", suit: "Kale" },
      ];
      const twoKingsQueens: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "A", suit: "Kale" },
      ];

      expect(compareHands(twoAcesKings, twoKingsQueens)).toBe(1);
      expect(compareHands(twoKingsQueens, twoAcesKings)).toBe(-1);
    });

    it("two pair with same high pair but better low pair wins", () => {
      const twoAcesKings: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "K", suit: "Radish" },
        { rank: "Q", suit: "Kale" },
      ];
      const twoAcesQueens: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "K", suit: "Kale" },
      ];

      expect(compareHands(twoAcesKings, twoAcesQueens)).toBe(1);
      expect(compareHands(twoAcesQueens, twoAcesKings)).toBe(-1);
    });

    it("flush with higher cards wins", () => {
      const flushHighAce: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "K", suit: "Kale" },
        { rank: "Q", suit: "Kale" },
        { rank: "J", suit: "Kale" },
        { rank: "9", suit: "Kale" },
      ];
      const flushHighKing: Card[] = [
        { rank: "K", suit: "Barley" },
        { rank: "J", suit: "Barley" },
        { rank: "9", suit: "Barley" },
        { rank: "8", suit: "Barley" },
        { rank: "3", suit: "Barley" },
      ];

      expect(compareHands(flushHighAce, flushHighKing)).toBe(1);
      expect(compareHands(flushHighKing, flushHighAce)).toBe(-1);
    });

    it("high card with higher cards wins", () => {
      const highAceKing: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "J", suit: "Radish" },
        { rank: "9", suit: "Kale" },
      ];
      const highAceQueen: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "Q", suit: "Barley" },
        { rank: "J", suit: "Wheat" },
        { rank: "10", suit: "Radish" },
        { rank: "9", suit: "Kale" },
      ];

      expect(compareHands(highAceKing, highAceQueen)).toBe(1);
      expect(compareHands(highAceQueen, highAceKing)).toBe(-1);
    });

    it("three of a kind with higher trips wins", () => {
      const threeAces: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "A", suit: "Wheat" },
        { rank: "K", suit: "Radish" },
        { rank: "Q", suit: "Kale" },
      ];
      const threeKings: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "A", suit: "Radish" },
        { rank: "Q", suit: "Kale" },
      ];

      expect(compareHands(threeAces, threeKings)).toBe(1);
      expect(compareHands(threeKings, threeAces)).toBe(-1);
    });

    it("full house with higher trips wins", () => {
      const fullHouseAcesKings: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "A", suit: "Wheat" },
        { rank: "K", suit: "Radish" },
        { rank: "K", suit: "Kale" },
      ];
      const fullHouseKingsAces: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "A", suit: "Radish" },
        { rank: "A", suit: "Kale" },
      ];

      expect(compareHands(fullHouseAcesKings, fullHouseKingsAces)).toBe(1);
      expect(compareHands(fullHouseKingsAces, fullHouseAcesKings)).toBe(-1);
    });

    it("four of a kind with higher quads wins", () => {
      const fourAces: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "A", suit: "Barley" },
        { rank: "A", suit: "Wheat" },
        { rank: "A", suit: "Radish" },
        { rank: "K", suit: "Kale" },
      ];
      const fourKings: Card[] = [
        { rank: "K", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "K", suit: "Radish" },
        { rank: "A", suit: "Kale" },
      ];

      expect(compareHands(fourAces, fourKings)).toBe(1);
      expect(compareHands(fourKings, fourAces)).toBe(-1);
    });

    it("identical hands result in tie", () => {
      const hand1: Card[] = [
        { rank: "A", suit: "Kale" },
        { rank: "K", suit: "Barley" },
        { rank: "Q", suit: "Wheat" },
        { rank: "J", suit: "Radish" },
        { rank: "10", suit: "Kale" },
      ];
      const hand2: Card[] = [
        { rank: "A", suit: "Barley" },
        { rank: "K", suit: "Wheat" },
        { rank: "Q", suit: "Radish" },
        { rank: "J", suit: "Kale" },
        { rank: "10", suit: "Barley" },
      ];

      expect(compareHands(hand1, hand2)).toBe(0);
    });
  });
});
