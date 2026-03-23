import React from "react";

import { PortalProvider } from "./example/lib/PortalProvider";
import { Ocean } from "features/world/ui/Ocean";

import { WalletProvider } from "features/wallet/WalletProvider";

import { PortalExample } from "./example/PortalExample";
import { CONFIG } from "lib/config";

export const PortalApp: React.FC = () => {
  // PortalProvider - gives you access to a xstate machine which handles state management
  return (
    <WalletProvider>
      <PortalProvider>
        <Ocean>
          <PortalExample />
        </Ocean>
      </PortalProvider>
    </WalletProvider>
  );
};
