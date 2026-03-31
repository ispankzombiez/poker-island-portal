import React, { useEffect, useState } from "react";
import { PortalGameState } from "../types";
import { Modal } from "components/ui/Modal";
import { OuterPanel } from "components/ui/Panel";
import { SUNNYSIDE } from "assets/sunnyside";
import { PortalBasket } from "./PortalBasket";
import { PortalCloseButtonPanel, PortalPanelTabs } from "./PortalPanel";

interface Props {
  show: boolean;
  onHide: () => void;
  state: PortalGameState;
  selectedBasketItem?: string;
  onSelectBasketItem: (name: string) => void;
}

type TabId = "Items";

const LAST_INVENTORY_TAB_KEY = "portal.inventory.lastTab";

function getStoredTab(): TabId | undefined {
  try {
    const value = localStorage.getItem(LAST_INVENTORY_TAB_KEY);
    if (value === "Items") {
      return value;
    }
  } catch {
    // ignore
  }
  return undefined;
}

function setStoredTab(tab: TabId) {
  try {
    localStorage.setItem(LAST_INVENTORY_TAB_KEY, tab);
  } catch {
    // ignore
  }
}

/**
 * Portal inventory modal - shows purchased shop items
 * Adapted from game's InventoryItemsModal.tsx
 */
export const PortalInventoryItemsModal: React.FC<Props> = ({
  show,
  onHide,
  state,
  selectedBasketItem,
  onSelectBasketItem,
}) => {
  const storedTab = getStoredTab();
  const initialTab: TabId = storedTab ?? "Items";
  const [currentTab, setCurrentTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setStoredTab(currentTab);
  }, [currentTab]);

  const itemsTab: PortalPanelTabs<TabId> = {
    icon: SUNNYSIDE.icons.basket,
    name: "Items",
    id: "Items",
  };

  const tabs: PortalPanelTabs<TabId>[] = [itemsTab];

  return (
    <Modal size="lg" show={show} onHide={onHide}>
      <PortalCloseButtonPanel
        tabs={tabs}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onClose={onHide}
      >
        {currentTab === "Items" && (
          <PortalBasket
            state={state}
            selected={selectedBasketItem}
            onSelect={onSelectBasketItem}
          />
        )}
      </PortalCloseButtonPanel>
    </Modal>
  );
};
