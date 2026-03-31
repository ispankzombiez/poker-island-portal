import React, { useState, useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/NightshadeArcadePortalProvider";
import { PIXEL_SCALE } from "../constants";
import { SUNNYSIDE } from "assets/sunnyside";
import { goHome } from "../../lib/portalUtil";
import { HudContainer } from "components/ui/HudContainer";
import { PortalInventory } from "./PortalInventory";
import Decimal from "decimal.js-light";

import flowerIcon from "assets/icons/flower_token.webp";
import coinsIcon from "assets/icons/coins.webp";
import gemIcon from "assets/icons/gem.webp";
import ravenCoinIcon from "assets/icons/RavenCoin.webp";
import { formatNumber } from "lib/utils/formatNumber";

/**
 * Nightshade Arcade-specific Balances component (matches game HUD styling without GameProvider dependency)
 */
const NightshadeArcadeBalances: React.FC<{
  sfl: Decimal;
  coins: number;
  gems: Decimal;
  ravenCoins?: Decimal;
}> = ({ sfl, coins, gems, ravenCoins }) => {
  const [showFullBalance, setShowFullBalance] = useState(false);

  return (
    <>
      <div className="flex flex-col space-y-1 items-end !text-[28px] text-stroke">
        <div className="flex cursor-pointer items-center space-x-3 relative">
          <div className="h-9 w-full bg-black opacity-30 absolute coins-bb-hud-backdrop" />
          {/* Coins */}
          <div className="flex items-center space-x-2">
            <span className="balance-text mt-0.5">{formatNumber(coins)}</span>
            <img
              src={coinsIcon}
              alt="Coins"
              style={{
                width: 25,
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="balance-text mt-0.5">{formatNumber(gems)}</span>
            <img
              src={gemIcon}
              alt="Gems"
              style={{
                marginTop: 2,
                width: 28,
              }}
            />
          </div>
        </div>
        {/* FLOWER */}
        <div
          className="flex items-center space-x-2 relative cursor-pointer"
          onClick={() => setShowFullBalance(!showFullBalance)}
        >
          <div className="h-9 w-full bg-black opacity-25 absolute sfl-hud-backdrop -z-10" />
          <span className="balance-text">
            {formatNumber(sfl, { decimalPlaces: showFullBalance ? 8 : 4 })}
          </span>
          <img
            src={flowerIcon}
            alt="FLOWER"
            style={{
              width: 26,
            }}
          />
          {ravenCoins !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="balance-text mt-0.5">{formatNumber(ravenCoins)}</span>
              <img
                src={ravenCoinIcon}
                alt="RavenCoins"
                style={{
                  width: 25,
                  height: 25,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const NightshadeArcadeHud: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const travelHome = () => {
    goHome();
  };

  return (
    <HudContainer>
      {/* Left side: Buttons */}
      <div
        className="absolute bottom-0 p-2.5 left-0 flex flex-col space-y-2.5"
      >
        {/* Travel Button */}
        <div
          id="travel"
          className="flex relative z-50 justify-center cursor-pointer hover:img-highlight group"
          style={{
            width: `${PIXEL_SCALE * 22}px`,
            height: `${PIXEL_SCALE * 23}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            travelHome();
          }}
        >
          <img
            src={SUNNYSIDE.ui.round_button_pressed}
            className="absolute"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
            }}
          />
          <img
            src={SUNNYSIDE.ui.round_button}
            className="absolute group-active:translate-y-[2px]"
            style={{
              width: `${PIXEL_SCALE * 22}px`,
            }}
          />
          <img
            src={SUNNYSIDE.icons.worldIcon}
            style={{
              width: `${PIXEL_SCALE * 12}px`,
              left: `${PIXEL_SCALE * 5}px`,
              top: `${PIXEL_SCALE * 4}px`,
            }}
            className="absolute group-active:translate-y-[2px]"
          />
        </div>
      </div>

      {/* Top Right: Balances */}
      <div className="absolute right-0 top-0 p-2.5">
        <NightshadeArcadeBalances
          sfl={new Decimal(portalState.context.state.balance)}
          coins={portalState.context.state.coins}
          gems={new Decimal(portalState.context.state.inventory["Gem"] ?? 0)}
          ravenCoins={new Decimal(portalState.context.state.inventory["RavenCoin"] ?? 0)}
        />
      </div>

      {/* Right Middle: Inventory */}
      <div className="absolute right-0 top-24 p-2.5 flex flex-col space-y-2.5">
        <PortalInventory
          state={portalState.context.state}
          isFarming={false}
          isFullUser={false}
          hideActions
        />
      </div>
    </HudContainer>
  );
};
