import React from "react";
import { MinigameName } from "../types";
import { PokerGame } from "../mini-games/poker/PokerGame";
import { BlackjackGame } from "../mini-games/black-jack/BlackjackGame";
import { GoFishGame } from "../mini-games/go-fish/GoFishGame";
import { UnoGame } from "../mini-games/uno/UnoGame";
import { SolitaireGame } from "../mini-games/solitaire/SolitaireGame";
import { GoblinInvadersGame } from "../mini-games/goblin-invaders/GoblinInvadersGame";

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
      return <BlackjackGame initialChips={100} onClose={onClose} />;
    case "gofish":
      return <GoFishGame onClose={onClose} />;
    case "uno":
      return <UnoGame onClose={onClose} />;
    case "solitaire":
      return <SolitaireGame onClose={onClose} />;
    case "goblin-invaders":
      return <GoblinInvadersGame onClose={onClose} />;
    case "roulette":
      // TODO: Implement roulette (to be created)
      return (
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>{"Roulette coming soon!"}</p>
        </div>
      );
    default:
      return (
        <div style={{ padding: "20px", color: "#fff" }}>
          <p>
            {"Game not found:"} {gameName}
          </p>
        </div>
      );
  }
};
