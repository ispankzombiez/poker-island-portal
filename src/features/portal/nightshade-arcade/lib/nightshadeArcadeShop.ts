/**
 * Nightshade Arcade Shop Items
 * All items are tagged with "nightshade-arcade" category
 * Uses same pattern as game's WORKBENCH_TOOLS, COUPONS, COMMODITIES, etc.
 */

import { ArcadeItemName } from "../types/arcadeItems";

type NightshadeArcadeItem = {
  name: ArcadeItemName;
  cost: {
    items: Record<string, number>;
  };
  cooldownMs?: number;
};

type NightshadeArcadeShopTier = {
  items: NightshadeArcadeItem[];
  requirement?: number;
};

type NightshadeArcadeShopData = {
  basic: NightshadeArcadeShopTier;
  rare: NightshadeArcadeShopTier;
  epic: NightshadeArcadeShopTier;
  mega: NightshadeArcadeShopTier;
};

/**
 * Shop inventory - all prices in RavenCoins
 * Items sourced from ITEM_DETAILS (real game items)
 */
export const NIGHTSHADE_ARCADE_SHOP: NightshadeArcadeShopData = {
  basic: {
    items: [
      {
        name: "Nightshade Ticket",
        cost: { items: { RavenCoin: 50 } },
      },
      {
        name: "Mushroom Soup",
        cost: { items: { RavenCoin: 25 } },
      },
      {
        name: "Pumpkin Soup",
        cost: { items: { RavenCoin: 28 } },
      },
      {
        name: "Kale Stew",
        cost: { items: { RavenCoin: 35 } },
      },
      {
        name: "Roasted Cauliflower",
        cost: { items: { RavenCoin: 20 } },
      },
      {
        name: "Blueberry Jam",
        cost: { items: { RavenCoin: 22 } },
      },
    ],
  },
  rare: {
    requirement: 250,
    items: [
      {
        name: "Honey Cake",
        cost: { items: { RavenCoin: 80 } },
      },
      {
        name: "Mushroom Jacket Potatoes",
        cost: { items: { RavenCoin: 75 } },
      },
      {
        name: "Kale & Mushroom Pie",
        cost: { items: { RavenCoin: 90 } },
      },
      {
        name: "Orange Cake",
        cost: { items: { RavenCoin: 85 } },
      },
      {
        name: "Sunflower Crunch",
        cost: { items: { RavenCoin: 70 } },
      },
    ],
  },
  epic: {
    requirement: 500,
    items: [
      {
        name: "Beetroot Cake",
        cost: { items: { RavenCoin: 150 } },
      },
      {
        name: "Carrot Cake",
        cost: { items: { RavenCoin: 160 } },
      },
      {
        name: "Pumpkin Cake",
        cost: { items: { RavenCoin: 155 } },
      },
      {
        name: "Cauliflower Cake",
        cost: { items: { RavenCoin: 165 } },
      },
      {
        name: "Wheat Cake",
        cost: { items: { RavenCoin: 170 } },
      },
    ],
  },
  mega: {
    requirement: 1000,
    items: [
      {
        name: "Apple Juice",
        cost: { items: { RavenCoin: 300 } },
      },
      {
        name: "Orange Juice",
        cost: { items: { RavenCoin: 320 } },
      },
      {
        name: "Purple Smoothie",
        cost: { items: { RavenCoin: 350 } },
      },
      {
        name: "Banana Blast",
        cost: { items: { RavenCoin: 340 } },
      },
    ],
  },
};
