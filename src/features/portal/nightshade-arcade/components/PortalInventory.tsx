import React, { useContext, useEffect, useState } from "react";
import { PortalGameState } from "../types";
import { PortalBasketButton } from "./PortalBasketButton";
import { PortalInventoryItemsModal } from "./PortalInventoryItemsModal";
import { PIXEL_SCALE } from "../constants";

interface Props {
  state: PortalGameState;
  isFarming: boolean;
  isFullUser: boolean;
  hideActions: boolean;
}

/**
 * Portal inventory display - shows basket button and inventory modal
 * Adapted from game's Inventory.tsx
 */
export const PortalInventory: React.FC<Props> = ({
  state,
  isFarming,
  isFullUser,
  hideActions,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBasketItem, setSelectedBasketItem] = useState<string>();

  useEffect(() => {
    // Could add PubSub listener if needed like the game does
  }, []);

  const handleBasketItemClick = (item: string) => {
    setSelectedBasketItem(item);
  };

  return (
    <>
      <div
        className="flex flex-col items-end"
        style={{
          right: `${PIXEL_SCALE * 3}px`,
          top: `${PIXEL_SCALE * (isFarming ? 58 : 31)}px`,
        }}
      >
        <PortalBasketButton
          onClick={() => setIsOpen(true)}
        />
      </div>

      <PortalInventoryItemsModal
        key={isOpen ? "open" : "closed"}
        show={isOpen}
        onHide={() => {
          setIsOpen(false);
        }}
        state={state}
        selectedBasketItem={selectedBasketItem}
        onSelectBasketItem={handleBasketItemClick}
      />
    </>
  );
};
