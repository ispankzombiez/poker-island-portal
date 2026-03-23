import React, { useContext } from "react";
import { useSelector } from "@xstate/react";
import { Context } from "features/game/GameProvider";
import { SpeakingModal } from "features/game/components/SpeakingModal";
import { Decimal } from "decimal.js-light";

interface Props {
  onClose: () => void;
}

const _gameState = (state: any) => state?.context?.state;

export const DailyChipsReward: React.FC<Props> = ({ onClose }) => {
  const { gameService } = useContext(Context);

  const gameStateValue = useSelector(gameService!, _gameState);
  const gameState = gameService ? gameStateValue : undefined;

  const dateKey = new Date().toISOString().slice(0, 10);

  // Daily chips logic
  const lastClaimDate = gameState?.dailyChipsLastClaimDate || null;
  const isEligibleForDailyChips =
    !lastClaimDate || lastClaimDate !== dateKey;

  const currentChips = new Decimal(gameState?.inventory?.Chip ?? 0);
  const maxChips = new Decimal(10);
  const dailyChipsReward = maxChips.minus(currentChips);

  const onClaimDailyChips = () => {
    gameService.send("dailyChips.claimed", {
      reward: dailyChipsReward.toNumber(),
    });
    onClose();
  };

  if (!isEligibleForDailyChips) {
    // Already claimed today
    return (
      <SpeakingModal
        onClose={onClose}
        message={[
          {
            text: "You've already claimed your daily reward! Come back tomorrow.",
          },
        ]}
      />
    );
  }

  if (dailyChipsReward.lte(0)) {
    // Already at max chips
    return (
      <SpeakingModal
        onClose={onClose}
        message={[
          {
            text: "You already have the maximum 10 chips! Spend some chips to claim more.",
          },
        ]}
      />
    );
  }

  // Eligible and has reward
  return (
    <SpeakingModal
      onClose={onClaimDailyChips}
      message={[
        {
          text: `Daily reward! You've been awarded ${dailyChipsReward.toNumber()} chip${
            dailyChipsReward.equals(1) ? "" : "s"
          }!`,
          actions: [
            {
              text: "Claim",
              cb: onClaimDailyChips,
            },
          ],
        },
      ]}
    />
  );
};
