# Casino Island Portal Architecture

## Overview

Portals in Sunflower Land are mini-games loaded in an iframe with access to the player's game state. This document shows the complete architecture and data flow for implementing UI buttons in the Casino Island portal.

---

## 1. How Existing Portals Load and Use Player Data

### Complete Data Flow

```
User clicks portal → loadPortal() → Portal API → GameState → Phaser Scene
                                                              ↓
                                                         PortalContext
                                                              ↓
                                                         UI Components
```

### Key Files

#### [src/features/portal/actions/loadPortal.ts](src/features/portal/actions/loadPortal.ts)
**Purpose**: Loads player data from the backend API

```typescript
export async function loadPortal(request: Request) {
  // GET /portal/{portalId}/player
  const response = await window.fetch(
    `${getUrl()}/portal/${request.portalId}/player`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${request.token}`,
      },
    },
  );

  const data: { farm: GameState } = await response.json();
  const game = makeGame(data.farm);
  return { game };
}
```

**What it does:**
- Fetches player's farm data from backend using JWT token
- Transforms raw farm data into GameState using `makeGame()`
- Returns GameState object with all player resources, inventory, etc.

---

#### [src/features/portal/example/lib/portalMachine.ts](src/features/portal/example/lib/portalMachine.ts)
**Purpose**: XState machine managing portal state lifecycle

```typescript
export interface Context {
  id: number;              // Player's farm ID
  jwt: string;             // Authentication token
  state: GameState;        // Complete game state from backend
}

export const portalMachine = createMachine({
  id: "festivalOfColorsMachine",
  initial: "initialising",
  context: {
    id: 0,
    jwt: getJwt(),
    state: CONFIG.API_URL ? undefined : OFFLINE_FARM,
  },
  states: {
    initialising: {
      always: [
        { target: "unauthorised", cond: (context) => !context.jwt },
        { target: "loading" },
      ],
    },

    loading: {
      invoke: {
        src: async (context) => {
          const { farmId } = decodeToken(context.jwt as string);
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
        onError: { target: "error" },
      },
    },

    playing: {
      on: {
        PURCHASED: {
          actions: [
            () => {
              alert("Thank you for purchasing!");
            },
          ],
        },
      },
    },

    error: {
      on: {
        RETRY: { target: "initialising" },
      },
    },
  },
});
```

**Key Points:**
- **States**: `initialising` → `loading` → `playing` (or `error`/`unauthorised`)
- **Context stores**: Farm ID, JWT token, and full GameState
- **Loading step**: Where `loadPortal()` is called to fetch data

---

#### [src/features/portal/example/lib/PortalProvider.tsx](src/features/portal/example/lib/PortalProvider.tsx)
**Purpose**: React context provider wrapping the portal state machine

```typescript
export const PortalContext = React.createContext<PortalContext>(
  {} as PortalContext,
);

export const PortalProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const portalService = useInterpret(
    portalMachine,
  ) as unknown as MachineInterpreter;

  // Listens for messages from parent window (e.g., purchase confirmations)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.event === "purchased") {
        portalService.send("PURCHASED");
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <PortalContext.Provider value={{ portalService }}>
      {children}
    </PortalContext.Provider>
  );
};
```

**Key Points:**
- Uses XState's `useInterpret()` to create a persistent machine service
- Provides `portalService` to all children via React Context
- Listens for postMessage events from parent window

---

### Data Flow in PokerIslandPortal

#### [src/features/portal/example/PokerIslandPortal.tsx](src/features/portal/example/PokerIslandPortal.tsx)

```typescript
export const PokerIslandPortal: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const gameState = useSelector(portalService, _gameState);

  // Handle loading, error, unauthorised states...

  return (
    <div>
      {gameState && <PokerIslandPhaser />}  // Render when data is loaded
    </div>
  );
};
```

**Flow:**
1. Gets `portalService` from `PortalProvider` context
2. Uses `useActor()` to subscribe to service state changes
3. Waits for `gameState` to be available (from `portalMachine.context.state`)
4. Renders Phaser component once data is loaded

---

## 2. How Game State is Passed to Phaser Scenes

#### [src/features/portal/example/PokerIslandPhaser.tsx](src/features/portal/example/PokerIslandPhaser.tsx)

```typescript
export const PokerIslandPhaser: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);
  const game = useRef<Game>(undefined);

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      parent: "game-content",
      width: window.innerWidth,
      height: window.innerHeight,
      scene: [Preloader, PokerIslandScene],
      // ... other config
    };

    game.current = new Game(config);

    // CRITICAL: Pass data to Phaser via registry
    game.current.registry.set("initialScene", "poker_island");
    game.current.registry.set("gameState", portalState.context.state);
    game.current.registry.set("id", portalState.context.id);
    game.current.registry.set("portalService", portalService);

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  return (
    <div>
      <div id="game-content" />
      <NPCModals id={portalState.context.id as number} />
      <InteractableModals
        id={portalState.context.id as number}
        scene="poker_island"
      />
    </div>
  );
};
```

**Key Points:**
- Creates Phaser Game instance with scenes array
- **Uses Phaser's `registry`** to share data with scenes
- Sets: `gameState`, `id`, `portalService`, and `initialScene`
- Can be accessed in scenes via: `this.registry.get("gameState")`

---

#### [src/features/portal/example/PokerIslandScene.tsx](src/features/portal/example/PokerIslandScene.tsx)

```typescript
export class PokerIslandScene extends BaseScene {
  sceneId: SceneId = "poker_island";

  constructor() {
    super({
      name: "poker_island",
      map: { json: mapJson },
      audio: { fx: { walk_key: "dirt_footstep" } },
    });
  }

  preload() {
    super.preload();
    this.load.image("tileset", "world/tilesheet.png");
    // ... load assets
  }

  async create() {
    // Access game state from registry
    const gameState: GameState = this.registry.get("gameState");
    const farmId: number = this.registry.get("id");
    const portalService = this.registry.get("portalService");

    this.map = this.make.tilemap({ key: "poker_island" });
    super.create();

    // Add sprites, set up interactions, etc.
    const dealer1 = this.add.sprite(120, 310, "dealer").setScale(1);
    dealer1.setInteractive({ cursor: "pointer" }).on("pointerdown", () => {
      if (this.checkDistanceToSprite(dealer1, 50)) {
        interactableModalManager.open("poker_island_roulette");
      }
    });
  }
}
```

**Key Points:**
- Extends `BaseScene` which is the Phaser Scene base class
- Accesses data via `this.registry.get(key)` in `create()` method
- `gameState` contains all player inventory, resources, etc.
- Can pass `portalService` to other components

---

## 3. How Normal Game Displays UI Buttons (Inventory, Map, Settings)

### Main Game Architecture

#### [src/features/world/Phaser.tsx](src/features/world/Phaser.tsx)
**Purpose**: Creates Phaser game instance for the main world

```typescript
export const PhaserComponent: React.FC<Props> = ({ mmoService, route }) => {
  const { gameService } = useContext(Context);
  const { toastsList } = useContext(ToastContext);
  const game = useRef<Game>(undefined);

  const scenes = [
    Preloader,
    BeachScene,
    PlazaScene,
    RetreatScene,
    KingdomScene,
    // ... more scenes
  ];

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: AUTO,
      parent: "phaser-example",
      width: window.innerWidth,
      height: window.innerHeight,
      scene: scenes,
      physics: {
        default: "arcade",
        arcade: { debug: true, gravity: { x: 0, y: 0 } },
      },
    };

    game.current = new Game(config);

    // Similar to portal - pass data via registry
    game.current.registry.set("initialScene", route);
    // ... other registry values

    return () => {
      game.current?.destroy(true);
    };
  }, []);

  return (
    <div>
      <div id="phaser-example" ref={ref} />
      {/* UI rendered OUTSIDE of Phaser */}
    </div>
  );
};
```

#### [src/features/world/World.tsx](src/features/world/World.tsx)
**Purpose**: Main game routing and structure

```typescript
export const MMO: React.FC<MMOProps> = ({ isCommunity }) => {
  // ... setup code

  return (
    <>
      <PhaserComponent
        mmoService={mmoService}
        isCommunity={isCommunity}
        inventory={gameState.context.state.inventory}
        route={name as SceneId}
      />

      <Modal show={isIntroducing}>
        <WorldIntroduction onClose={(username: string) => { /* */ }} />
      </Modal>
    </>
  );
};
```

---

### HUD Rendering Structure

#### [src/features/island/hud/WorldHud.tsx](src/features/island/hud/WorldHud.tsx)
**Purpose**: Displays all game UI buttons and overlays

```typescript
export const HudComponent: React.FC<Props> = ({ server, scene, messages, players }) => {
  const { gameService } = useContext(Context);
  const state = useSelector(gameService, _state);

  return (
    <>
      {/* Outside the Phaser container - pure React */}
      <HudContainer>
        {/* Top-left: Bumpkin profile */}
        <div className="absolute left-0 top-0">
          <HudBumpkin isTutorial={isTutorial} />
        </div>

        {/* Bottom-left: Game buttons */}
        <div className="absolute bottom-0 left-0 flex flex-col space-y-2.5">
          {hasFeatureAccess(state, "MODERATOR") && (
            <ModerationTools {...props} />
          )}
          <WorldFeedButton />
          <MarketplaceButton />
          <TravelButton />
        </div>

        {/* Inventory, Settings, Map */}
        {/* ... */}
      </HudContainer>
    </>
  );
};
```

**Key Points:**
- `HudContainer` wraps all UI (positioned absolutely above Phaser)
- UI is pure React, not Phaser
- Uses `gameService` context to access game state
- Components can trigger game state changes via `gameService.send()`

---

#### [src/features/island/hud/components/inventory/Inventory.tsx](src/features/island/hud/components/inventory/Inventory.tsx)
**Key component** showing inventory button and modal

```typescript
export const Inventory: React.FC<InventoryProps> = ({
  state,
  isFarming,
  isFullUser,
  hideActions,
}) => {
  // Renders inventory UI and handles clicks
  return (
    <div className="flex justify-center">
      <button onClick={() => setShowInventory(true)}>
        <img src={SUNNYSIDE.icons.chestIcon} />
      </button>
      <InventoryModal
        show={showInventory}
        onClose={() => setShowInventory(false)}
        state={state}
      />
    </div>
  );
};
```

---

## 4. How to Integrate UI Buttons into Poker Island Portal

### Pattern: Portal with Game UI Buttons

The key difference is that portals are **simpler** than the main game - they don't have an MMO machine or complex routing.

### Step 1: Update Portal HUD Component

#### [src/features/portal/example/components/PortalExampleHUD.tsx](src/features/portal/example/components/PortalExampleHUD.tsx)

**Current Example:**
```typescript
export const PortalExampleHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  return (
    <>
      <HudContainer>
        <Balances
          sfl={portalState.context.state.balance}
          coins={portalState.context.state.coins}
          gems={portalState.context.state.inventory["Gem"] ?? new Decimal(0)}
        />
        <Inventory
          state={portalState.context.state}
          isFarming={false}
          isFullUser={false}
          hideActions
        />
        {/* Go Home button */}
        <div className="fixed z-50 flex flex-col justify-between">
          {/* Button UI */}
        </div>
      </HudContainer>
    </>
  );
};
```

**What's Available:**
- `portalState.context.state` = Full GameState (inventory, balance, etc.)
- `portalState.context.id` = Player's farm ID
- All UI components work with this state

### Step 2: Create Custom HUD for Poker Island

Example structure:

```typescript
// New file: src/features/portal/example/components/PokerIslandHUD.tsx

export const PokerIslandHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  return (
    <HudContainer>
      {/* Top-left: Player balances */}
      <div className="absolute top-0 left-0 p-2">
        <Balances
          sfl={portalState.context.state.balance}
          coins={portalState.context.state.coins}
          gems={portalState.context.state.inventory["Gem"] ?? new Decimal(0)}
        />
      </div>

      {/* Bottom-left: Inventory & Settings */}
      <div className="absolute bottom-0 left-0 p-2 flex flex-col gap-2">
        <Inventory
          state={portalState.context.state}
          isFarming={false}
          isFullUser={false}
          hideActions
        />
        <button onClick={goHome}>Exit Game</button>
      </div>
    </HudContainer>
  );
};
```

### Step 3: Add HUD to PokerIslandPortal

Update [src/features/portal/example/PokerIslandPortal.tsx](src/features/portal/example/PokerIslandPortal.tsx):

```typescript
import { PokerIslandHUD } from "./components/PokerIslandHUD";

export const PokerIslandPortal: React.FC = () => {
  // ... state handling

  return (
    <div>
      {gameState && (
        <>
          <PokerIslandHUD />           {/* Add this */}
          <PokerIslandPhaser />
        </>
      )}
    </div>
  );
};
```

---

## 5. Data Flow Summary for Poker Island

```
┌─────────────────────────────────────────────────────────────┐
│ URL: https://sunflower-land.com/?jwt=token&portal=poker    │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │  PortalApp.tsx                        │
        │  ├─ WalletProvider                    │
        │  └─ PortalProvider                    │
        │     └─ PokerIslandPortal              │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │ PortalProvider creates portalMachine  │
        │ (State: initialising → loading → ... )│
        │                                       │
        │ Context: {                            │
        │   id: number,                         │
        │   jwt: string,                        │
        │   state: GameState    ← Loaded here  │
        │ }                                     │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │ PokerIslandPortal.tsx                 │
        │ ├─ PokerIslandHUD                     │
        │ │  ├─ Inventory (uses gameState)      │
        │ │  ├─ Balances (uses gameState)       │
        │ │  └─ Exit button (goHome())          │
        │ │                                     │
        │ └─ PokerIslandPhaser                  │
        │    ├─ Creates Phaser Game instance    │
        │    ├─ Sets registry with gameState    │
        │    └─ Renders PokerIslandScene        │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │ PokerIslandScene extends BaseScene    │
        │ ├─ Accesses: this.registry.get("...") │
        │ ├─ Gets: gameState, id, portalService│
        │ └─ Renders: Map, NPCs, Colliders      │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │ HTML Structure:                       │
        │ ├─ <div id="game-content">            │
        │ │  └─ Phaser renders here             │
        │ ├─ <div id="phaser-example">          │
        │ │  └─ HUD (Inventory, Buttons)        │
        │ └─ position: fixed, z-index: overlap  │
        └───────────────────────────────────────┘
```

---

## 6. Complete File Reference

### Core Portal Files

| File | Purpose |
|------|---------|
| [src/features/portal/PortalApp.tsx](src/features/portal/PortalApp.tsx) | Entry point for all portals |
| [src/features/portal/actions/loadPortal.ts](src/features/portal/actions/loadPortal.ts) | Fetches player data from API |
| [src/features/portal/example/lib/portalMachine.ts](src/features/portal/example/lib/portalMachine.ts) | XState machine managing portal state lifecycle |
| [src/features/portal/example/lib/PortalProvider.tsx](src/features/portal/example/lib/PortalProvider.tsx) | React context provider for portal state |
| [src/features/portal/lib/portalUtil.ts](src/features/portal/lib/portalUtil.ts) | Utility functions (purchase, donation, exit, etc.) |

### Poker Island Specific

| File | Purpose |
|------|---------|
| [src/features/portal/example/PokerIslandPortal.tsx](src/features/portal/example/PokerIslandPortal.tsx) | Main portal component with state handling |
| [src/features/portal/example/PokerIslandPhaser.tsx](src/features/portal/example/PokerIslandPhaser.tsx) | Creates Phaser game instance and sets registry |
| [src/features/portal/example/PokerIslandScene.tsx](src/features/portal/example/PokerIslandScene.tsx) | Phaser scene with map, NPCs, interactions |
| [src/features/portal/example/components/PortalExampleHUD.tsx](src/features/portal/example/components/PortalExampleHUD.tsx) | Example HUD component (inventory, buttons) |

### Related Game Architecture

| File | Purpose |
|------|---------|
| [src/features/world/scenes/BaseScene.ts](src/features/world/scenes/BaseScene.ts) | Base class for all game scenes (used by PokerIslandScene) |
| [src/features/world/Phaser.tsx](src/features/world/Phaser.tsx) | Main game Phaser setup (similar pattern to portals) |
| [src/features/world/World.tsx](src/features/world/World.tsx) | Game routing and state management |
| [src/features/island/hud/WorldHud.tsx](src/features/island/hud/WorldHud.tsx) | Main game HUD (buttons, inventory, settings) |
| [src/features/island/hud/components/inventory/Inventory.tsx](src/features/island/hud/components/inventory/Inventory.tsx) | Inventory button and modal |

---

## 7. Key Concepts

### Phaser Registry
```typescript
// In Phaser component (React)
game.current.registry.set("gameState", portalState.context.state);

// In Phaser scene
const gameState = this.registry.get("gameState");
```
**Purpose**: Pass data from React context to Phaser scenes

### Portal Context Flow
```
PortalProvider (xstate machine)
    ↓ useContext()
PokerIslandPortal (state subscription)
    ├─ PokerIslandHUD (access portalState)
    └─ PokerIslandPhaser (pass to Phaser registry)
        └─ PokerIslandScene (access via registry)
```

### Game State Structure
```typescript
interface GameState {
  balance: number;                    // SFL balance
  inventory: Record<string, Decimal>; // Items: Gem, Wood, etc.
  coins: number;                      // Coins balance
  // ... many more properties
}
```

---

## 8. Exiting and Purchase Flow

### Exit Portal
```typescript
// In HUD component
import { goHome } from "../../lib/portalUtil";

<button onClick={() => goHome()}>Exit</button>

// Sends message to parent window
export function goHome() {
  if (isInIframe) {
    window.parent.postMessage({ event: "closePortal" }, "*");
  }
}
```

### Purchase Flow
```typescript
// In game logic
import { purchase } from "../../lib/portalUtil";

purchase({
  sfl: 100,
  items: { Gem: 5 }
});

// Parent window confirms, sends back message
// PortalProvider listens and updates state
window.addEventListener("message", (event) => {
  if (event.data.event === "purchased") {
    portalService.send("PURCHASED");
  }
});
```

---

## Key Takeaways

1. **State Loading**: `loadPortal()` → `portalMachine.loading` → `portalState.context.state`
2. **Scene Access**: Pass via `game.current.registry.set()` → Access via `this.registry.get()` in scene
3. **UI Integration**: React components alongside Phaser with `position: fixed` and `z-index`
4. **Context Pattern**: Wrap with `PortalProvider` → Use `useContext(PortalContext)` → Get `portalService`
5. **Base Class**: `PokerIslandScene extends BaseScene` provides common methods like `checkDistanceToSprite()`
6. **Component Reuse**: Inventory, Balances components work directly with `GameState`
