import React, { useContext, useEffect, useRef } from "react";
import { Game, AUTO } from "phaser";
import NinePatchPlugin from "phaser3-rex-plugins/plugins/ninepatch-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";

import { Preloader } from "features/world/scenes/Preloader";
import { PortalContext } from "./lib/PortalProvider";
import { useActor, useSelector } from "@xstate/react";
import { CasinoIslandScene } from "./CasinoIslandScene";
import { CasinoIslandHUD } from "./components/CasinoIslandHUD";
import { PortalMachineState } from "./lib/portalMachine";
import { casinoIslandEvents } from "./casinoIslandEvents";

export const CasinoIslandPhaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const gameState = useSelector(portalService, (state: PortalMachineState) => state.context.state);

  const game = useRef<Game>(undefined);

  // Casino Island scene
  const scene = "casino_island";
  const scenes = [Preloader, CasinoIslandScene];

  // Register chest click handler that will communicate back to parent
  useEffect(() => {
    // Create a fallback handler that posts to parent
    const fallbackHandler = () => {
      // Post message to parent window - works even if parent === window
      window.parent.postMessage({ event: "chestClicked" }, "*");
    };
    
    // Only register if not already registered (CasinoIsland component might register first)
    if (!casinoIslandEvents.onChestClicked) {
      casinoIslandEvents.registerChestClickHandler(fallbackHandler);
    }
    
    return () => {
      // Only clean up if we registered it
      if (casinoIslandEvents.onChestClicked === fallbackHandler) {
        casinoIslandEvents.registerChestClickHandler(null);
      }
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      fps: {
        target: 30,
        smoothStep: true,
      },
      backgroundColor: "#000000",
      parent: "phaser-example",

      autoRound: true,
      pixelArt: true,
      plugins: {
        global: [
          {
            key: "rexNinePatchPlugin",
            plugin: NinePatchPlugin,
            start: true,
          },
          {
            key: "rexVirtualJoystick",
            plugin: VirtualJoystickPlugin,
            start: true,
          },
        ],
      },
      width: window.innerWidth,
      height: window.innerHeight,

      physics: {
        default: "arcade",
        arcade: {
          debug: true,
          gravity: { x: 0, y: 0 },
        },
      },
      scene: scenes,
      loader: {
        crossOrigin: "anonymous",
      },
    };

    game.current = new Game({
      ...config,
      parent: "game-content",
    });

    game.current.registry.set("initialScene", scene);
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <CasinoIslandHUD gameState={gameState} />
      <div id="game-content" ref={ref} />
    </div>
  );
};
