import React, { useState } from "react";
import { PIXEL_SCALE } from "features/game/lib/constants";
import { Modal } from "components/ui/Modal";
import { WorldMap } from "./WorldMap";
import { RoundButton } from "components/ui/RoundButton";
import { SUNNYSIDE } from "assets/sunnyside";
import { goHome } from "features/portal/lib/portalUtil";

const isInPortal = window.self !== window.top;

export const Travel: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const onClose = () => {
    setShowModal(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isInPortal) {
      // In a portal context, exit the portal instead of opening world map
      goHome();
    } else {
      // In main game, open the world map
      setShowModal(true);
    }
  };

  // In a portal, render button that exits only - no modal
  if (isInPortal) {
    return (
      <RoundButton onClick={handleClick}>
        <img
          src={SUNNYSIDE.icons.worldIcon}
          id="world-icon"
          style={{
            width: `${PIXEL_SCALE * 12}px`,
            left: `${PIXEL_SCALE * 5}px`,
            top: `${PIXEL_SCALE * 4}px`,
          }}
          className="absolute group-active:translate-y-[2px]"
        />
      </RoundButton>
    );
  }

  // In main game, render button with world map modal
  return (
    <>
      <RoundButton onClick={handleClick}>
        <img
          src={SUNNYSIDE.icons.worldIcon}
          id="world-icon"
          style={{
            width: `${PIXEL_SCALE * 12}px`,
            left: `${PIXEL_SCALE * 5}px`,
            top: `${PIXEL_SCALE * 4}px`,
          }}
          className="absolute group-active:translate-y-[2px]"
        />
      </RoundButton>
      <Modal show={showModal} dialogClassName="md:max-w-3xl" onHide={onClose}>
        <WorldMap onClose={onClose} />
      </Modal>
    </>
  );
};

export const TravelButton = React.memo(Travel);
