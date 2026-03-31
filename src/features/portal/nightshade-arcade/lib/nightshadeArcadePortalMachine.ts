import { assign, createMachine, Interpreter, State } from "xstate";
import { getJwt, getUrl, loadPortal } from "../../actions/loadPortal";
import { CONFIG } from "lib/config";
import { decodeToken } from "features/auth/actions/login";
import { Decimal } from "decimal.js-light";
import { NIGHTSHADE_ARCADE_SHOP } from "./nightshadeArcadeShop";
import { PortalGameState, MinigameName } from "../types";
import { DEFAULT_PORTAL_STATE } from "./defaultState";

export interface Context {
  id: number;
  jwt: string;
  state: PortalGameState;
}

export type PortalEvent = 
  | { type: "PURCHASED" } 
  | { type: "RETRY" }
  | { type: "dailyRavenCoins.claimed"; reward: number }
  | { type: "chapterItem.bought"; name: string; tier: string };

export type PortalState = {
  value: "initialising" | "error" | "unauthorised" | "loading" | "playing";
  context: Context;
};

export type MachineInterpreter = Interpreter<
  Context,
  any,
  PortalEvent,
  PortalState
>;

export type PortalMachineState = State<Context, PortalEvent, PortalState>;

export const nightshadeArcadePortalMachine = createMachine({
  id: "nightshadeArcadeMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJwt(),
    state: DEFAULT_PORTAL_STATE,
  },
  states: {
    initialising: {
      always: [
        {
          target: "unauthorised",
          // TODO: Also validate token
          cond: (context) => !!CONFIG.API_URL && !context.jwt,
        },
        {
          target: "loading",
        },
      ],
    },

    loading: {
      id: "loading",
      invoke: {
        src: async (context) => {
          if (!getUrl()) {
            return {
              game: DEFAULT_PORTAL_STATE,
            };
          }

          const { farmId } = decodeToken(context.jwt as string);

          // Load the portal data from API
          const { game } = await loadPortal({
            portalId: CONFIG.PORTAL_APP,
            token: context.jwt as string,
          });

          return { game, farmId };
        },
        onDone: [
          {
            target: "playing",
            actions: assign({
              state: (_: any, event) => event.data.game,
              id: (_: any, event) => event.data.farmId,
            }),
          },
        ],
        onError: {
          target: "error",
        },
      },
    },

    playing: {
      on: {
        PURCHASED: {
          actions: [
            () => {
              // Put your logic once purchase is complete
              alert("Thank you for purchasing!");
            },
          ],
        },
        "dailyRavenCoins.claimed": {
          actions: [
            assign({
              state: (context) => {
                const dateKey = new Date().toISOString().slice(0, 10);
                const lastClaimDate = context.state.dailyRavenCoinsLastClaimDate ?? null;
                const isEligible = lastClaimDate === null || lastClaimDate !== dateKey;

                if (isEligible) {
                  const currentRavenCoins = new Decimal(context.state.inventory.RavenCoin ?? 0);
                  const dailyReward = new Decimal(1000);

                  return {
                    ...context.state,
                    inventory: {
                      ...context.state.inventory,
                      RavenCoin: currentRavenCoins.plus(dailyReward).toNumber(),
                    },
                    dailyRavenCoinsLastClaimDate: dateKey,
                  };
                }
                return context.state;
              },
            }),
          ],
        },
        "chapterItem.bought": {
          actions: [
            assign({
              state: (context, event: any) => {
                const { name, tier } = event as { name: string; tier: "basic" | "rare" | "epic" | "mega" };
                
                // Find the item in the shop
                const tierItems = NIGHTSHADE_ARCADE_SHOP[tier]?.items || [];
                const item = tierItems.find((i: any) => i.name === name);
                
                if (!item) {
                  console.warn(`Item ${name} not found in ${tier} tier`);
                  return context.state;
                }
                
                const cost = item.cost.items.RavenCoin || 0;
                const currentRavenCoins = new Decimal(context.state.inventory.RavenCoin ?? 0);
                
                // Check if player has enough RavenCoins
                if (currentRavenCoins.lt(cost)) {
                  console.warn(`Not enough RavenCoins. Have ${currentRavenCoins}, need ${cost}`);
                  return context.state;
                }
                
                // Deduct RavenCoins and add item to inventory
                const newRavenCoins = currentRavenCoins.minus(cost);
                const currentItemCount = (context.state.inventory[name] as any) || 0;
                
                return {
                  ...context.state,
                  inventory: {
                    ...context.state.inventory,
                    RavenCoin: newRavenCoins.toNumber(),
                    [name]: (currentItemCount as any) + 1,
                  },
                };
              },
            }),
          ],
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: "initialising",
        },
      },
    },
    unauthorised: {},
  },
});
