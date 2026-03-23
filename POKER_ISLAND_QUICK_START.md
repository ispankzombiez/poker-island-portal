# Quick Reference: Adding UI Buttons to Casino Island Portal

## Super Quick Version

**Goal**: Show Inventory, Balances, and custom buttons above the Phaser game.

### Step 1: Create the HUD Component

**File**: `src/features/portal/example/components/PokerIslandHUD.tsx`

```typescript
import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { HudContainer } from "components/ui/HudContainer";
import { Inventory } from "features/island/hud/components/inventory/Inventory";
import { Balances } from "components/Balances";
import { goHome } from "../../lib/portalUtil";
import Decimal from "decimal.js-light";
import { SUNNYSIDE } from "assets/sunnyside";
import { PIXEL_SCALE } from "features/game/lib/constants";

export const PokerIslandHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  return (
    <HudContainer>
      {/* Top-Left: Balances */}
      <div className="absolute top-0 left-0 p-2">
        <Balances
          sfl={portalState.context.state.balance ?? 0}
          coins={portalState.context.state.coins ?? 0}
          gems={portalState.context.state.inventory?.["Gem"] ?? new Decimal(0)}
        />
      </div>

      {/* Bottom-Left: Inventory & Settings */}
      <div className="absolute bottom-0 left-0 p-2 flex flex-col gap-2">
        <Inventory
          state={portalState.context.state}
          isFarming={false}
          isFullUser={false}
          hideActions
        />
      </div>

      {/* Bottom-Right: Exit Button */}
      <div className="absolute bottom-0 right-0 p-2">
        <button
          onClick={() => goHome()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Exit
        </button>
      </div>
    </HudContainer>
  );
};
```

### Step 2: Update PokerIslandPortal

**File**: `src/features/portal/example/PokerIslandPortal.tsx`

Change this:
```typescript
return (
  <div>
    {gameState && <PokerIslandPhaser />}
  </div>
);
```

To this:
```typescript
import { PokerIslandHUD } from "./components/PokerIslandHUD";

return (
  <div>
    {gameState && (
      <>
        <PokerIslandHUD />          {/* ADD THIS */}
        <PokerIslandPhaser />
      </>
    )}
  </div>
);
```

### Step 3: Done! 

Your portal now has:
- ✅ SFL/Coins/Gems balances (top-left)
- ✅ Inventory button (bottom-left)
- ✅ Exit home button (bottom-right)

---

## How It Works

1. **Access game state**: `useContext(PortalContext)` → `portalService` → `portalState.context.state`
2. **Subscribe to updates**: `useActor(portalService)` watches for changes
3. **Pass to components**: `Inventory`, `Balances` components receive GameState
4. **UI overlays game**: CSS `position: fixed` keeps buttons above Phaser

---

## Accessing Game State in Components

```typescript
import { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";

export const MyComponent = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  const gameState = portalState.context.state;

  // Now you have:
  // - gameState.balance        (SFL)
  // - gameState.coins          (coins)
  // - gameState.inventory      ({ Gem: 50, Wood: 200, ... })
  // - gameState.bumpkin        (player info)
  // - ... everything else
};
```

---

## Custom Buttons

### Simple Click Handler

```typescript
<button onClick={() => {
  console.log("Gems:", portalState.context.state.inventory["Gem"]);
  // Do something
}}>
  Check Gems
</button>
```

### Purchase Items

```typescript
import { purchase } from "../../lib/portalUtil";

<button onClick={() => {
  purchase({
    sfl: 100,           // Cost in SFL
    items: { Gem: 5 }   // Items consumed
  });
}}>
  Buy Gems
</button>
```

### Submit Score

```typescript
import { submitScore } from "../../lib/portalUtil";

<button onClick={() => {
  submitScore({ score: 12500 });
}}>
  Save Score
</button>
```

### Exit Game

```typescript
import { goHome } from "../../lib/portalUtil";

<button onClick={() => goHome()}>
  Exit to Village
</button>
```

### Claim Prize

```typescript
import { claimPrize } from "../../lib/portalUtil";

<button onClick={() => {
  claimPrize();
}}>
  Claim Prize
</button>
```

---

## Common Patterns

### Show if Player Has Items

```typescript
const hasGems = portalState.context.state.inventory?.["Gem"]?.gt(0);

return (
  <>
    {hasGems && (
      <button>Use Gems</button>
    )}
  </>
);
```

### Show Player Balance

```typescript
<p>SFL: {portalState.context.state.balance}</p>
<p>Coins: {portalState.context.state.coins}</p>
```

### Display Inventory Count

```typescript
const gemCount = portalState.context.state.inventory?.["Gem"] ?? new Decimal(0);
<p>You have {gemCount.toString()} Gems</p>
```

---

## Styling

Use Tailwind CSS classes (already available):

```typescript
<div className="absolute bottom-0 left-0 p-2 flex flex-col gap-2">
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Click Me
  </button>
</div>
```

Or use SUNNYSIDE theme:

```typescript
import { SUNNYSIDE } from "assets/sunnyside";

<img src={SUNNYSIDE.ui.round_button} />
<img src={SUNNYSIDE.icons.chestIcon} />
<img src={SUNNYSIDE.icons.worldIcon} />
```

---

## Troubleshooting

### Button not showing?
- Check `position: fixed` is on parent
- Check `z-index` is high enough (>50)
- Make sure HUD is rendered BEFORE Phaser in JSX

### Can't access game state?
- Verify `useContext(PortalContext)` - must be inside PokerIslandPortal tree
- Use `useActor()` to subscribe
- Use selector if needed: `useSelector(portalService, state => state.context.state)`

### Changes not updating?
- Make sure you're using `useActor()` not just `useContext()`
- Only `useActor()` triggers component re-renders

---

## File References

| File | Location |
|------|----------|
| PokerIslandHUD | `src/features/portal/example/components/PokerIslandHUD.tsx` |
| PokerIslandPortal | `src/features/portal/example/PokerIslandPortal.tsx` |
| PokerIslandPhaser | `src/features/portal/example/PokerIslandPhaser.tsx` |
| HudContainer | `components/ui/HudContainer.tsx` |
| Inventory | `src/features/island/hud/components/inventory/Inventory.tsx` |
| Balances | `components/Balances.tsx` |
| portalUtil | `src/features/portal/lib/portalUtil.ts` |
| PortalContext | `src/features/portal/example/lib/PortalProvider.tsx` |
| portalMachine | `src/features/portal/example/lib/portalMachine.ts` |

---

## Example: Complete Minimal HUD

```typescript
// src/features/portal/example/components/PokerIslandHUD.tsx

import React, { useContext } from "react";
import { useActor } from "@xstate/react";
import { PortalContext } from "../lib/PortalProvider";
import { HudContainer } from "components/ui/HudContainer";
import { Balances } from "components/Balances";
import { goHome } from "../../lib/portalUtil";
import Decimal from "decimal.js-light";

export const PokerIslandHUD: React.FC = () => {
  const { portalService } = useContext(PortalContext);
  const [portalState] = useActor(portalService);

  return (
    <HudContainer>
      {/* Balances: Top-left */}
      <div className="absolute top-4 left-4">
        <Balances
          sfl={portalState.context.state.balance}
          coins={portalState.context.state.coins}
          gems={portalState.context.state.inventory?.["Gem"] ?? new Decimal(0)}
        />
      </div>

      {/* Exit Button: Bottom-right */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => goHome()}
          className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
        >
          ← Back to Village
        </button>
      </div>
    </HudContainer>
  );
};
```

Then in PokerIslandPortal.tsx:
```typescript
import { PokerIslandHUD } from "./components/PokerIslandHUD";

// In the return JSX:
{gameState && (
  <>
    <PokerIslandHUD />
    <PokerIslandPhaser />
  </>
)}
```

**That's it!** You now have game UI buttons integrated into your portal.
