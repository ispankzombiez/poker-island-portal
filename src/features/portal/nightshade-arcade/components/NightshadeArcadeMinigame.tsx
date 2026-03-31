import React from "react";
import { MinigameName } from "../types";
import { PokerGame } from "../mini-games/poker/PokerGame";

interface Props {
  gameName: MinigameName;
  onClose: () => void;
}

/**
 * Standalone minigame loader for Nightshade Arcade
 * Renders local minigame components without requiring GameProvider
 */
export const NightshadeArcadeMinigame: React.FC<Props> = ({
  gameName,
  onClose,
}) => {
  // Render the appropriate minigame component based on gameName
  switch (gameName) {
    case "poker":
      return <PokerGame initialChips={100} onClose={onClose} />;
    case "blackjack":
      // TODO: Implement blackjack (to be created)
      return (
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Blackjack coming soon!</p>
        </div>
      );
    case "roulette":
      // TODO: Implement roulette (to be created)
      return (
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Roulette coming soon!</p>
        </div>
      );
    default:
      return (
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>Game not found: {gameName}</p>
        </div>
      );
  }
};
