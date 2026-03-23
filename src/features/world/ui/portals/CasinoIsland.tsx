import React, { useContext, useState, useCallback, useEffect } from "react";
import { Button } from "components/ui/Button";
import { useSelector } from "@xstate/react";
import { Context } from "features/game/GameProvider";
import * as AuthProvider from "features/auth/lib/Provider";
import { useAppTranslation } from "lib/i18n/useAppTranslations";
import { Label } from "components/ui/Label";
import factions from "assets/icons/factions.webp";
import { Portal } from "./Portal";
import { InlineDialogue } from "../TypingMessage";
import { isMinigameComplete } from "features/game/events/minigames/claimMinigamePrize";
import { ClaimReward } from "features/game/expansion/components/ClaimReward";
import { PortalLeaderboard } from "./PortalLeaderboard";
import { MachineState } from "features/game/lib/gameMachine";
import { MinigamePrizeUI } from "./MinigamePrizeUI";
import { Decimal } from "decimal.js-light";
import { casinoIslandEvents } from "features/portal/example/casinoIslandEvents";

interface Props {
  onClose: () => void;
}

const _minigames = (state: any) => state?.context?.state?.minigames ?? { games: {}, prizes: {} };
const _gameState = (state: any) => state?.context?.state;

export const CasinoIsland: React.FC<Props> = ({ onClose }) => {
  const { authService } = useContext(AuthProvider.Context);
  const { gameService } = useContext(Context);

  const minigamesValue = useSelector(gameService!, _minigames);
  const gameStateValue = useSelector(gameService!, _gameState);
  
  const minigames = gameService ? minigamesValue : { games: {}, prizes: {} };
  const gameState = gameService ? gameStateValue : undefined;
  const minigame = minigames.games["casino-island"];
  const prize = minigames.prizes["casino-island"];

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showDailyChipsModal, setShowDailyChipsModal] = useState<boolean>(false);

  const [page, setPage] = useState<"play" | "leaderboard">("play");

  const { t } = useAppTranslation();

  const dateKey = new Date().toISOString().slice(0, 10);
  const history = minigame?.history ?? {};

  const dailyAttempt = history[dateKey] ?? { attempts: 0, highscore: 0 };

  // Daily chips logic
  const lastClaimDate = gameState?.dailyChipsLastClaimDate || null;
  const isEligibleForDailyChips =
    !lastClaimDate || lastClaimDate !== dateKey;

  const currentChips = new Decimal(gameState?.inventory?.Chip ?? 0);
  const maxChips = new Decimal(10);
  const dailyChipsReward = maxChips.minus(currentChips);
  const hasChipsToReward =
    !!gameState && isEligibleForDailyChips && dailyChipsReward.gt(0);



  const playNow = () => {
    setIsPlaying(true);
  };

  const onClaim = () => {
    gameService.send("minigame.prizeClaimed", { id: "casino-island" });

    onClose();
  };

  const onClaimDailyChips = () => {
    gameService.send("dailyChips.claimed", {
      reward: dailyChipsReward.toNumber(),
    });
    // Close the modal after claiming
    setShowDailyChipsModal(false);
  };

  const handleChestClicked = useCallback(() => {
    setShowDailyChipsModal(true);
  }, []);

  // Register the chest click handler in the global event emitter
  useEffect(() => {
    console.log("[CasinoIsland] Registering chest click handler in casinoIslandEvents");
    casinoIslandEvents.registerChestClickHandler(handleChestClicked);
    
    return () => {
      console.log("[CasinoIsland] Cleaning up chest click handler");
      casinoIslandEvents.registerChestClickHandler(null);
    };
  }, [handleChestClicked]);

  if (isPlaying) {
    // Show daily chips modal if triggered while playing
    if (showDailyChipsModal) {
      if (!isEligibleForDailyChips) {
        // Already claimed today
        return (
          <div>
            <Portal portalName="casino-island" onClose={onClose} onChestClicked={handleChestClicked} />
            <ClaimReward
              onClaim={() => setShowDailyChipsModal(false)}
              reward={{
                message: "You've already claimed your daily reward! Come back tomorrow.",
                factionPoints: 0,
                id: "daily-chips-claimed",
                items: {},
                wearables: {},
                sfl: 0,
                coins: 0,
              }}
            />
          </div>
        );
      }

      if (dailyChipsReward.lte(0)) {
        // Already at max chips
        return (
          <div>
            <Portal portalName="casino-island" onClose={onClose} onChestClicked={handleChestClicked} />
            <ClaimReward
              onClaim={() => setShowDailyChipsModal(false)}
              reward={{
                message: "You already have the maximum 10 chips! Spend some chips to claim more.",
                factionPoints: 0,
                id: "daily-chips-max",
                items: {},
                wearables: {},
                sfl: 0,
                coins: 0,
              }}
            />
          </div>
        );
      }

      // Show the reward claim
      if (isEligibleForDailyChips && dailyChipsReward.gt(0)) {
        return (
          <div>
            <Portal portalName="casino-island" onClose={onClose} onChestClicked={handleChestClicked} />
            <ClaimReward
              onClaim={onClaimDailyChips}
              reward={{
                message: `Daily reward! You've been awarded ${dailyChipsReward.toNumber()} chip${
                  dailyChipsReward.equals(1) ? "" : "s"
                }.`,
                factionPoints: 0,
                id: "daily-chips",
                items: { Chip: dailyChipsReward.toNumber() },
                wearables: {},
                sfl: 0,
                coins: 0,
              }}
            />
          </div>
        );
      }
    }

    // Show game without modal when no chips to reward
    return (
      <div>
        <Portal portalName="casino-island" onClose={onClose} onChestClicked={handleChestClicked} />
      </div>
    );
  }

  const isComplete = isMinigameComplete({
    minigames,
    name: "casino-island",
  });

  // Show daily chips claim before anything else if eligible
  if (hasChipsToReward && !isPlaying) {
    return (
      <ClaimReward
        onClaim={onClaimDailyChips}
        reward={{
          message: `Daily reward! You've been awarded ${dailyChipsReward.toNumber()} chip${
            dailyChipsReward.equals(1) ? "" : "s"
          }.`,
          factionPoints: 0,
          id: "daily-chips",
          items: { Chip: dailyChipsReward.toNumber() },
          wearables: {},
          sfl: 0,
          coins: 0,
        }}
      />
    );
  }

  if (isComplete && !dailyAttempt.prizeClaimedAt && prize) {
    return (
      <ClaimReward
        onClaim={onClaim}
        reward={{
          message:
            "Congratulations, you won at Casino Island! Here is your reward.",
          factionPoints: 0,
          id: "discord-bonus",
          items: prize.items,
          wearables: prize.wearables,
          sfl: 0,
          coins: prize.coins,
        }}
      />
    );
  }

  if (page === "leaderboard") {
    return (
      <PortalLeaderboard
        farmId={gameService.getSnapshot().context.farmId}
        jwt={authService.getSnapshot().context.user.rawToken as string}
        onBack={() => setPage("play")}
        name={"casino-island"}
      />
    );
  }

  return (
    <>
      <div className="mb-1">
        <div className="p-2">
          <Label type="default" className="mb-1" icon={factions}>
            {t("minigame.casinoIsland")}
          </Label>
          <InlineDialogue message={t("minigame.casinoIslandHelp")} />
        </div>

        <MinigamePrizeUI
          prize={prize}
          history={dailyAttempt}
          mission={`Mission: Win at Casino Island`}
        />
      </div>
      <div className="flex">
        <Button className="mr-1" onClick={() => setPage("leaderboard")}>
          {t("competition.leaderboard")}
        </Button>
        <Button onClick={playNow}>{t("minigame.playNow")}</Button>
      </div>
    </>
  );
};
