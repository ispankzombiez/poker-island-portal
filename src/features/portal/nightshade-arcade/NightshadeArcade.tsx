import React, { useContext, useEffect, useState, useCallback } from "react";

import { useActor, useSelector } from "@xstate/react";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";

import { PortalContext } from "./lib/NightshadeArcadePortalProvider";
import { Label } from "components/ui/Label";

import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { NightshadeArcadeHud } from "./components/NightshadeArcadeHud";
import { DailyRavenCoinReward } from "./components/DailyRavenCoinReward";
import { NightshadeArcadeMinigame } from "./components/NightshadeArcadeMinigame";
import { NightshadeArcadeShop } from "./components/NightshadeArcadeShop";
import { nightshadeArcadeEvents } from "./lib/nightshadeArcadeEvents";
import { minigamesEventEmitter } from "./lib/minigamesEvents";
import { MinigameName } from "./types";
import { NightshadeArcadePhaser } from "./NightshadeArcadePhaser";

import { authorisePortal } from "../lib/portalUtil";
import { PortalMachineState } from "./lib/nightshadeArcadePortalMachine";
import { Loading } from "features/auth/components";
import { CONFIG } from "lib/config";
import { getFont, getLanguage } from "../actions/loadPortal";
import i18n from "lib/i18n";
import { changeFont } from "lib/utils/fonts";

const _gameState = (state: PortalMachineState) => state.context.state;

/**
 * Nightshade Arcade portal - a standalone minigame portal
 */
export const NightshadeArcade: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const { t } = useAppTranslation();
  const [showDailyRavenCoinsModal, setShowDailyRavenCoinsModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showMinigameModal, setShowMinigameModal] = useState<boolean>(false);
  const [activeMinigame, setActiveMinigame] = useState<MinigameName | null>(null);

  const gameState = useSelector(portalService, _gameState);

  // Handler for chest clicks
  const handleChestClicked = useCallback(() => {
    setShowDailyRavenCoinsModal(true);
  }, []);

  // Handler for minigame requests
  const handleMinigameRequested = useCallback((gameType: string) => {
    setActiveMinigame(gameType as MinigameName);
    setShowMinigameModal(true);
  }, []);

  // Handler for shop open requests
  const handleOpenShop = useCallback(() => {
    setShowShopModal(true);
  }, []);

  // Register the chest click handler in the global event emitter
  useEffect(() => {
    console.log("[NightshadeArcade] Registering chest click handler");
    nightshadeArcadeEvents.registerChestClickHandler(handleChestClicked);
    
    return () => {
      console.log("[NightshadeArcade] Cleaning up chest click handler");
      nightshadeArcadeEvents.registerChestClickHandler(null);
    };
  }, [handleChestClicked]);

  // Register the minigame handler in the global event emitter
  useEffect(() => {
    console.log("[NightshadeArcade] Registering minigame handler");
    nightshadeArcadeEvents.registerMinigameHandler(handleMinigameRequested);
    
    return () => {
      console.log("[NightshadeArcade] Cleaning up minigame handler");
      nightshadeArcadeEvents.registerMinigameHandler(null);
    };
  }, [handleMinigameRequested]);

  // Register the shop handler in the global event emitter
  useEffect(() => {
    console.log("[NightshadeArcade] Registering shop handler");
    nightshadeArcadeEvents.registerShopHandler(handleOpenShop);
    
    return () => {
      console.log("[NightshadeArcade] Cleaning up shop handler");
      nightshadeArcadeEvents.registerShopHandler(null);
    };
  }, [handleOpenShop]);

  // Subscribe to minigames events
  useEffect(() => {
    console.log("[NightshadeArcade] Subscribing to minigames events");
    
    const unsubscribePoker = minigamesEventEmitter.subscribe("poker", () => {
      console.log("[NightshadeArcade] Poker event received from scene");
      setActiveMinigame("poker");
      setShowMinigameModal(true);
    });

    return () => {
      console.log("[NightshadeArcade] Unsubscribing from minigames events");
      unsubscribePoker();
    };
  }, []);

  useEffect(() => {
    // load language from query params
    const parentLanguage = getLanguage();
    const appLanguage = localStorage.getItem("language") || "en";

    if (appLanguage !== parentLanguage) {
      localStorage.setItem("language", parentLanguage);
      i18n.changeLanguage(parentLanguage);
    }

    // load font from query params
    const font = getFont();
    changeFont(font);
  }, []);

  if (portalState.matches("error")) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("error.wentWrong")}</span>
          </div>
          <Button onClick={() => portalService.send("RETRY")}>
            {t("retry")}
          </Button>
        </Panel>
      </Modal>
    );
  }

  if (portalState.matches("unauthorised")) {
    return (
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="danger">{t("error")}</Label>
            <span className="text-sm my-2">{t("session.expired")}</span>
          </div>
          <Button onClick={authorisePortal}>{t("welcome.login")}</Button>
        </Panel>
      </Modal>
    );
  }

  if (portalState.matches("loading")) {
    return (
      <Modal show>
        <Panel>
          <Loading />
          <span className="text-xs">
            {`${t("last.updated")}:${CONFIG.CLIENT_VERSION}`}
          </span>
        </Panel>
      </Modal>
    );
  }

  return (
    <div>
      {gameState && (
        <>
          <Modal show={showDailyRavenCoinsModal} onHide={() => setShowDailyRavenCoinsModal(false)}>
            <DailyRavenCoinReward onClose={() => setShowDailyRavenCoinsModal(false)} />
          </Modal>
          <Modal show={showShopModal} onHide={() => setShowShopModal(false)}>
            <NightshadeArcadeShop 
              onClose={() => setShowShopModal(false)} 
              portalService={portalService}
            />
          </Modal>
          {activeMinigame && (
            <Modal show={showMinigameModal} onHide={() => setShowMinigameModal(false)}>
              <NightshadeArcadeMinigame 
                gameName={activeMinigame} 
                onClose={() => setShowMinigameModal(false)}
              />
            </Modal>
          )}
          <NightshadeArcadeHud />
          <NightshadeArcadePhaser />
        </>
      )}
    </div>
  );
};
