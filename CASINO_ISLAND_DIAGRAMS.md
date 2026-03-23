## Casino Island Portal: Data Flow Diagrams

### 1. Complete Portal Initialization Flow

```
┌────────────────────────────────────────────────────────────────┐
│ URL: https://sunflower-land.com/testnet/?jwt=TOKEN&portal=poker
│                         ↓
│              index.html → main.tsx
│              App.tsx + CONFIG
│                         ↓
│              Navigation.tsx (routes to portal)
│                         ↓
│            PortalApp.tsx (entry point)
│                         ↓
│     ┌──────────────────────────────────────┐
│     │ WalletProvider (optional)             │
│     │ └─ PortalProvider (REQUIRED)          │
│     │    │  Creates portalMachine service  │
│     │    │  Sets up message listeners      │
│     │    │                                  │
│     │    └─ PokerIslandPortal              │
│     │       (Conditionally renders:)        │
│     │       ├─ Loading screen               │
│     │       ├─ Error state                  │
│     │       ├─ Unauthorised state           │
│     │       └─ Playing state:                │
│     │          ├─ PokerIslandHUD (React UI) │
│     │          └─ PokerIslandPhaser (Game)  │
│     └──────────────────────────────────────┘
│
└────────────────────────────────────────────────────────────────┘
```

### 2. Portal State Machine Lifecycle

```
                    START
                      │
                      ↓
             ┌─────────────────┐
             │  initialising   │
             │                 │
             │ Check JWT token │
             └────────┬────────┘
                      │
          ┌───────────┴──────────────────┐
          │                              │
    If no JWT            If JWT present
          │                              │
          ↓                              ↓
    ┌─────────────┐          ┌────────────────┐
    │ unauthorised│          │    loading     │
    │   (error)   │          │                │
    └─────────────┘          │ loadPortal(    │
                             │   portalId,    │
                             │   jwt token    │
                             │ )              │
                             └────────┬───────┘
                                      │
                 ┌────────────────────┴────────────────┐
                 │                                     │
            Success                                Error
                 │                                     │
                 ↓                                     ↓
         ┌──────────────┐                    ┌────────────┐
         │   playing    │                    │   error    │
         │              │◄──────RETRY────────│(retry)     │
         │ GameState ✓  │                    └────────────┘
         │ id ✓         │
         │ jwt ✓        │
         └──────────────┘
              │
        User interaction
         (purchases, exits)
              │
         Send event to
         parent window
         (postMessage)
```

### 3. GameState Loading Detail

```
┌──────────────────────────────────────────────────────┐
│   loadPortal() Action                                │
│   File: src/features/portal/actions/loadPortal.ts   │
│                                                      │
│  Input: {                                            │
│    portalId: string    (e.g., "poker_island")       │
│    token: string       (JWT from parent)            │
│  }                                                   │
│                                                      │
│  HTTP Call:                                          │
│  GET /portal/{portalId}/player                      │
│  Headers: Authorization: Bearer {token}            │
│                                                      │
│  Response: {                                         │
│    farm: {                                           │
│      balance: 1000                 (GameState)      │
│      inventory: {                                    │
│        Gem: "50",                                    │
│        Wood: "200",                                  │
│        ... (all items)                              │
│      },                                              │
│      coins: 5000,                                    │
│      bumpkin: { experience: 1500 },                 │
│      ... (all game data)                            │
│    }                                                │
│  }                                                   │
│                                                      │
│  Transform: makeGame(data.farm)                     │
│                                                      │
│  Return: { game: GameState }                        │
│                                                      │
└──────────────────────────────────────────────────────┘
              │
              ↓
     Store in portalMachine.context.state
              ↓
     Trigger portalState transition
              ↓
     React component re-renders
              ↓
    PokerIslandPortal → PokerIslandHUD + PokerIslandPhaser
```

### 4. Context Distribution (React Side)

```
┌─────────────────────────────────────────────────────┐
│         PortalProvider (Context)                    │
│         ┌───────────────────────────────────────┐   │
│         │ portalService: Interpreter            │   │
│         │ portalState:                          │   │
│         │   ├─ value: "playing"                 │   │
│         │   ├─ context: {                       │   │
│         │   │   id: 12345                       │   │
│         │   │   jwt: "eyJ..."                   │   │
│         │   │   state: GameState {              │   │
│         │   │     balance: 1000                 │   │
│         │   │     inventory: {...}              │   │
│         │   │     coins: 5000                   │   │
│         │   │   }                               │   │
│         │   │ }                                 │   │
│         └───────────────────────────────────────┘   │
│                         │                           │
│                         ↓                           │
│           useContext(PortalContext)                │
│                         │                           │
│          ┌──────────────┴──────────────┐           │
│          ↓                              ↓           │
│   ┌─────────────────┐        ┌──────────────────┐  │
│   │  PokerIsland    │        │  PokerIsland     │  │
│   │  HUD            │        │  Phaser          │  │
│   │                 │        │                  │  │
│   │ useActor()      │        │ Accesses via:    │  │
│   │ ├─ portalState  │        │                  │  │
│   │ │   .context    │        │ game.registry    │  │
│   │ │   .state      │        │   .set()         │  │
│   │ │   (GameState) │        │                  │  │
│   │ └─ inventory    │        │ Pass:            │  │
│   │    ├─ Balances  │        │ ├─ gameState     │  │
│   │    ├─ Inventory │        │ ├─ id            │  │
│   │    │   button   │        │ ├─ portalService │  │
│   │    └─ Settings  │        │ └─ initialScene  │  │
│   │                 │        │                  │  │
│   └─────────────────┘        └──────────────────┘  │
│                                    │                │
│                                    ↓                │
│                         ┌──────────────────────┐    │
│                         │  PokerIslandScene    │    │
│                         │  (Phaser Scene)      │    │
│                         │                      │    │
│                         │ Access:              │    │
│                         │ this.registry.get()  │    │
│                         │ ├─ gameState         │    │
│                         │ ├─ id                │    │
│                         │ ├─ portalService     │    │
│                         │ └─ triggers render   │    │
│                         │                      │    │
│                         └──────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 5. Rendering Structure (DOM)

```
┌─────────────────────────────────────────────────────┐
│                   HTML Body                         │
│                                                     │
│  ┌────────────────────────────────────────────┐   │
│  │  <div id="root">                           │   │
│  │  ┌──────────────────────────────────────┐  │   │
│  │  │  <PokerIslandPortal />               │  │   │
│  │  │                                      │  │   │
│  │  │  ┌──────────────────────────────┐   │  │   │
│  │  │  │  <PokerIslandHUD />          │   │  │   │
│  │  │  │  position: fixed             │   │  │   │
│  │  │  │  z-index: 50                 │   │  │   │
│  │  │  │  ┌──────────────────────┐    │   │  │   │
│  │  │  │  │ Balances (sfl/coins) │    │   │  │   │
│  │  │  │  ├──────────────────────┤    │   │  │   │
│  │  │  │  │ Inventory button     │    │   │  │   │
│  │  │  │  │ [🎁] Chest icon      │    │   │  │   │
│  │  │  │  ├──────────────────────┤    │   │  │   │
│  │  │  │  │ Settings button      │    │   │  │   │
│  │  │  │  ├──────────────────────┤    │   │  │   │
│  │  │  │  │ Exit Home button     │    │   │  │   │
│  │  │  │  │ [🏠]                 │    │   │  │   │
│  │  │  │  └──────────────────────┘    │   │  │   │
│  │  │  └──────────────────────────────┘   │  │   │
│  │  │  (overlays below)                    │  │   │
│  │  │                                      │  │   │
│  │  │  ┌──────────────────────────────┐   │  │   │
│  │  │  │  <PokerIslandPhaser />       │   │  │   │
│  │  │  │  ┌──────────────────────┐    │   │  │   │
│  │  │  │  │ <div id="game-       │    │   │  │   │
│  │  │  │  │      content">       │    │   │  │   │
│  │  │  │  │   [PHASER RENDERS    │    │   │  │   │
│  │  │  │  │    HERE - Canvas]    │    │   │  │   │
│  │  │  │  │                      │    │   │  │   │
│  │  │  │  │ PokerIslandScene     │    │   │  │   │
│  │  │  │  │ ├─ Map tiles         │    │   │  │   │
│  │  │  │  │ ├─ Dealer NPCs       │    │   │  │   │
│  │  │  │  │ ├─ Slot machines     │    │   │  │   │
│  │  │  │  │ ├─ Interactive areas │    │   │  │   │
│  │  │  │  │ └─ Colliders         │    │   │  │   │
│  │  │  │  └────────────────────┘     │   │  │   │
│  │  │  └──────────────────────────────┘   │  │   │
│  │  │                                      │  │   │
│  │  └──────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6. Scene Registry (Data Injection)

```
┌─────────────────────────────────────────────┐
│  Phaser Game Instance Registry              │
│  ┌───────────────────────────────────────┐  │
│  │ game.current.registry.set("key",val) │  │
│  ├───────────────────────────────────────┤  │
│  │ initialScene:  "poker_island"         │  │
│  │                                       │  │
│  │ gameState: GameState {                │  │
│  │   id: 12345                           │  │
│  │   balance: 1000                       │  │
│  │   inventory: { Gem: 50, Wood: 200 }   │  │
│  │   coins: 5000                         │  │
│  │   bumpkin: { ... }                    │  │
│  │ }                                     │  │
│  │                                       │  │
│  │ id: 12345 (farmId)                    │  │
│  │                                       │  │
│  │ portalService: Interpreter {          │  │
│  │   (XState machine service)            │  │
│  │   Can trigger state transitions       │  │
│  │ }                                     │  │
│  └───────────────────────────────────────┘  │
│                                              │
│        Consumed by Scene.create():           │
│        const gameState = this.registry.get() │
│                                              │
└─────────────────────────────────────────────┘
```

### 7. Event Communication (Parent ↔ iFrame)

```
┌──────────────────────┐                ┌──────────────────┐
│   Parent Window      │                │  Portal iFrame   │
│ (Sunflower Land)     │                │  (Poker Island)  │
│                      │                │                  │
│                      │    postMessage │                  │
│                      │ ┌──────────────→ window.parent.   │
│  Game runs           │ │  {              postMessage({  │
│  User plays          │ │   event:          event:       │
│  Money spent/earned  │ │   "purchase",     "purchase"   │
│                      │ │   sfl: 100,     })             │
│                      │ │   items: {..}                  │
│                      │ │  }                             │
│                      │ │                                │
│                      │ │                    ✓ User      │
│                      │ │                    confirms    │
│                      │ │                                │
│                      │         postMessage             │
│  Confirm purchase    │ ←──────────────────┤             │
│  Update player data  │     {                            │
│                      │  event:                          │
│                      │  "purchased",                    │
│                      │  sfl: 100,                       │
│                      │  items: {..}                     │
│                      │     }                            │
│                      │                                  │
│  PortalProvider      │                                  │
│  listens:            │     ✓ Message received           │
│  "purchased" →       │     portalService.send()         │
│  triggers update     │                                  │
│                      │                                  │
└──────────────────────┘                └──────────────────┘
```

### 8. Component Hierarchy

```
PortalApp.tsx
  ├─ WalletProvider
  │   └─ PortalProvider
  │       ├─ useInterpret(portalMachine)
  │       ├─ window.addEventListener("message", ...)
  │       └─ PortalContext.Provider
  │           │
  │           └─ PokerIslandPortal
  │               ├─ useContext(PortalContext)
  │               ├─ useActor(portalService)
  │               ├─ Conditional render based on state:
  │               │   ├─ "loading" → <Loading />
  │               │   ├─ "error" → <Panel> Error </Panel>
  │               │   ├─ "unauthorised" → <Panel> Login </Panel>
  │               │   └─ "playing" → {
  │               │       ├─ PokerIslandHUD
  │               │       │   ├─ useContext(PortalContext)
  │               │       │   ├─ useActor(portalService)
  │               │       │   ├─ <Balances />
  │               │       │   ├─ <Inventory />
  │               │       │   └─ <Button onClick={goHome} />
  │               │       │
  │               │       └─ PokerIslandPhaser
  │               │           ├─ useContext(PortalContext)
  │               │           ├─ useRef<Game>(undefined)
  │               │           ├─ Create Game instance:
  │               │           │   ├─ new Game(config)
  │               │           │   ├─ registry.set(...)
  │               │           │   └─ scene: [Preloader, PokerIslandScene]
  │               │           │
  │               │           ├─ <div id="game-content" />
  │               │           ├─ <NPCModals />
  │               │           └─ <InteractableModals />
  │
  └─ Preloader (Phaser Scene)
  └─ PokerIslandScene (Phaser Scene)
      ├─ extends BaseScene
      ├─ preload():
      │   ├─ this.load.image()
      │   ├─ this.load.spritesheet()
      │   └─ Setup sounds
      │
      └─ create():
          ├─ Get registry data:
          │   ├─ this.registry.get("gameState")
          │   ├─ this.registry.get("id")
          │   └─ this.registry.get("portalService")
          │
          ├─ Create map: this.make.tilemap()
          ├─ Add sprites: this.add.sprite()
          ├─ Add animations: this.anims.create()
          ├─ Setup interactions
          │   ├─ sprite.setInteractive()
          │   ├─ .on("pointerdown", ...)
          │   └─ interactableModalManager.open()
          │
          └─ Setup colliders, physics, etc.
```

---

## Key Files Summary Table

| Category | File | Purpose |
|----------|------|---------|
| **Entry** | PortalApp.tsx | App initialization with providers |
| **State** | portalMachine.ts | XState machine lifecycle |
| **Context** | PortalProvider.tsx | React context + message listeners |
| **Portal** | PokerIslandPortal.tsx | Main component, state handling |
| **UI** | PokerIslandHUD.tsx | Inventory, Balances, Buttons (React) |
| **Phaser Setup** | PokerIslandPhaser.tsx | Game instance creation, registry setup |
| **Scene** | PokerIslandScene.tsx | Map, NPCs, interactions (Phaser) |
| **API** | loadPortal.ts | Fetch player data from backend |
| **Utilities** | portalUtil.ts | goHome, purchase, submitScore, etc. |
