import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/NightshadeArcadePortalProvider";
import { PortalModal } from "./PortalModal";
import { Decimal } from "decimal.js-light";

interface Props {
  onClose: () => void;
}

export const DailyRavenCoinReward: React.FC<Props> = ({ onClose }) => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const gameState = portalState.context.state;

  const dateKey = new Date().toISOString().slice(0, 10); // Today's date in YYYY-MM-DD

  // Daily ravenCoins logic
  const lastClaimDate = gameState?.dailyRavenCoinsLastClaimDate || null;
  const isEligibleForDailyRavenCoins =
    !lastClaimDate || lastClaimDate !== dateKey;

  const dailyRavenCoinsReward = new Decimal(1000);

  const onClaimDailyRavenCoins = () => {
    portalService.send("dailyRavenCoins.claimed", {
      reward: dailyRavenCoinsReward.toNumber(),
    });
    onClose();
  };

  if (!isEligibleForDailyRavenCoins) {
    // Already claimed today
    return (
      <PortalModal
        onClose={onClose}
        message={[
          {
            text: "You've already claimed your daily reward! Come back tomorrow.",
          },
        ]}
      />
    );
  }



  // Eligible and has reward
  return (
    <PortalModal
      onClose={onClose}
      message={[
        {
          text: `Daily reward! You've been awarded ${dailyRavenCoinsReward.toNumber()} RavenCoin${
            dailyRavenCoinsReward.equals(1) ? "" : "s"
          }!`,
          actions: [
            {
              text: "Claim",
              cb: onClaimDailyRavenCoins,
            },
          ],
        },
      ]}
    />
  );
};
