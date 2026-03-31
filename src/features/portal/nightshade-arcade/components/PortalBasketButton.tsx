/**
 * Portal Basket Button
 * Simple button component for opening inventory
 * Matches game's BasketButton format exactly
 */

import { SUNNYSIDE } from "assets/sunnyside";
import { RoundButton } from "components/ui/RoundButton";
import { PIXEL_SCALE } from "../constants";
import { useSound } from "lib/utils/hooks/useSound";
import React from "react";
import classNames from "classnames";

export const PortalBasketButton: React.FC<{
  onClick: () => void;
  pulse?: boolean;
}> = ({ onClick, pulse }) => {
  const inventory = useSound("inventory");
  return (
    <RoundButton
      onClick={() => {
        inventory.play();
        onClick();
      }}
      className="mb-2"
    >
      <img
        src={SUNNYSIDE.icons.basket}
        className={classNames("absolute group-active:translate-y-[2px]", {
          "animate-pulsate": pulse,
        })}
        style={{
          top: `${PIXEL_SCALE * 5}px`,
          left: `${PIXEL_SCALE * 5}px`,
          width: `${PIXEL_SCALE * 12}px`,
        }}
      />
    </RoundButton>
  );
};
