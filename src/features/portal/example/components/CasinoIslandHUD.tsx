import React from "react";
import { HudContainer } from "components/ui/HudContainer";
import { GameState } from "features/game/types/game";

import flowerIcon from "assets/icons/flower_token.webp";
import coinsIcon from "assets/icons/coins.webp";
import gemIcon from "assets/icons/gem.webp";
import chipIcon from "assets/icons/chip.png";

import { formatNumber } from "lib/utils/formatNumber";

interface Props {
  gameState: GameState | undefined;
}

export const CasinoIslandHUD: React.FC<Props> = ({ gameState }) => {
  if (!gameState) {
    return null;
  }

  return (
    <HudContainer>
      {/* Top Right - Balances */}
      <div className="absolute right-0 top-0 p-2.5">
        <div className="flex flex-col space-y-1 items-end !text-[28px] text-stroke">
          {/* Currencies Row */}
          <div className="flex items-center space-x-3 relative">
            <div className="h-9 w-full bg-black opacity-30 absolute coins-bb-hud-backdrop" />
            {/* Coins */}
            <div className="flex items-center space-x-2">
              <span className="balance-text mt-0.5">
                {formatNumber(gameState.coins)}
              </span>
              <img
                src={coinsIcon}
                alt="Coins"
                style={{
                  width: 25,
                }}
              />
            </div>
            {/* Gems */}
            <div className="flex items-center space-x-2">
              <span className="balance-text mt-0.5">
                {formatNumber(gameState.inventory["Gem"] ?? 0)}
              </span>
              <img
                src={gemIcon}
                alt="Gems"
                style={{
                  marginTop: 2,
                  width: 28,
                }}
              />
            </div>
            {/* Chips */}
            <div className="flex items-center space-x-2">
              <span className="balance-text mt-0.5">
                {formatNumber(gameState.inventory["Chip"] ?? 0)}
              </span>
              <img
                src={chipIcon}
                alt="Chips"
                style={{
                  width: 25,
                  height: 25,
                }}
              />
            </div>
          </div>
          {/* SFL Row */}
          <div className="flex items-center space-x-2 relative">
            <div className="h-9 w-full bg-black opacity-25 absolute sfl-hud-backdrop -z-10" />
            <span className="balance-text">
              {formatNumber(gameState.balance, { decimalPlaces: 4 })}
            </span>
            <img
              src={flowerIcon}
              alt="SFL"
              style={{
                width: 26,
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Left - Player Info */}
      <div className="absolute left-0 top-0 p-2.5">
        <div className="text-white text-sm">
          <div className="font-bold">{gameState.bumpkin?.name || "Player"}</div>
          <div className="text-xs opacity-75">{`Farm #${gameState.id}`}</div>
        </div>
      </div>
    </HudContainer>
  );
};
