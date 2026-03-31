import React from "react";
import { useInterpret } from "@xstate/react";
import {
  MachineInterpreter,
  nightshadeArcadePortalMachine,
} from "./nightshadeArcadePortalMachine";

interface NightshadeArcadePortalContext {
  portalService: MachineInterpreter;
}

export const PortalContext = React.createContext<NightshadeArcadePortalContext>(
  {} as NightshadeArcadePortalContext,
);

export const NightshadeArcadePortalProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const portalService = useInterpret(
    nightshadeArcadePortalMachine,
  ) as unknown as MachineInterpreter;

  return (
    <PortalContext.Provider value={{ portalService }}>
      {children}
    </PortalContext.Provider>
  );
};
