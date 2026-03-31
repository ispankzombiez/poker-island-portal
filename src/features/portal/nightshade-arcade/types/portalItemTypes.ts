/**
 * Portal Item Types Wrapper
 * Re-exports game item types for inventory display purposes
 * This file makes explicit which game types we intentionally use
 *
 * Note: We reference game item types for display utilities.
 * Nightshade Arcade now uses GameState-backed portal state.
 */

// Re-export game item types for inventory display
export type {
  InventoryItemName,
  GameState,
  TemperateSeasonName,
} from "features/game/types/game";

export { COUPONS, FERTILISERS, EASTER_EGG } from "features/game/types/game";

export type {
  CropName,
  GreenHouseCropSeedName,
} from "features/game/types/crops";

export {
  CROP_SEEDS,
  CROPS,
  GREENHOUSE_CROPS,
  GREENHOUSE_SEEDS,
} from "features/game/types/crops";

export type { ConsumableName } from "features/game/types/consumables";

export {
  CONSUMABLES,
  COOKABLES,
  PIRATE_CAKE,
} from "features/game/types/consumables";

export type { SeedName } from "features/game/types/seeds";

export type { PatchFruitSeedName } from "features/game/types/fruits";

export { ANIMAL_RESOURCES, COMMODITIES } from "features/game/types/resources";

export { BEANS, EXOTIC_CROPS } from "features/game/types/beans";

export {
  GREENHOUSE_FRUIT_SEEDS,
  GREENHOUSE_FRUIT,
  PATCH_FRUIT,
  PATCH_FRUIT_SEEDS,
} from "features/game/types/fruits";

export { SEASONAL_SEEDS, SEEDS } from "features/game/types/seeds";

export { SELLABLE_TREASURES } from "features/game/types/treasure";

export {
  TREASURE_TOOLS,
  WORKBENCH_TOOLS,
  LOVE_ANIMAL_TOOLS,
} from "features/game/types/tools";

export {
  WORM,
  CROP_COMPOST,
  FRUIT_COMPOST,
} from "features/game/types/composters";

export { FISH, PURCHASEABLE_BAIT } from "features/game/types/fishing";

export type { FlowerName } from "features/game/types/flowers";

export {
  FLOWERS,
  FLOWER_SEEDS,
  isFlowerSeed,
} from "features/game/types/flowers";

export { ANIMAL_FOODS } from "features/game/types/animals";

export { RECIPE_CRAFTABLES } from "features/game/lib/crafting";

export { SEASON_ICONS } from "features/island/buildings/components/building/market/SeasonalSeeds";

export { CLUTTER } from "features/game/types/clutter";

export { PET_RESOURCES } from "features/game/types/pets";

export { PROCESSED_RESOURCES } from "features/game/types/processedFood";

export { CRUSTACEANS_DESCRIPTIONS } from "features/game/types/crustaceans";
