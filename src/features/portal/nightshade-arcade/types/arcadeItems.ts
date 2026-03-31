/**
 * Nightshade Arcade Items
 * Defines custom items that can be purchased from the arcade shop
 * This follows the same tagging pattern as game items (tools, resources, coupons)
 */

export type ArcadeItemName =
  | "Nightshade Ticket"
  | "Apple Pie"
  | "Mushroom Soup"
  | "Pumpkin Soup"
  | "Kale Stew"
  | "Roasted Cauliflower"
  | "Blueberry Jam"
  | "Honey Cake"
  | "Mushroom Jacket Potatoes"
  | "Kale & Mushroom Pie"
  | "Orange Cake"
  | "Sunflower Crunch"
  | "Beetroot Cake"
  | "Carrot Cake"
  | "Pumpkin Cake"
  | "Cauliflower Cake"
  | "Wheat Cake"
  | "Apple Juice"
  | "Orange Juice"
  | "Purple Smoothie"
  | "Banana Blast";

export interface ArcadeItem {
  description: string;
}

/**
 * Arcade items catalog
 * These items are flagged with the "nightshade-arcade" category
 * Similar to how game uses WORKBENCH_TOOLS, COUPONS, COMMODITIES, etc.
 */
export const ARCADE_ITEMS: Record<ArcadeItemName, ArcadeItem> = {
  // Special Item
  "Nightshade Ticket": {
    description: "A special ticket from the Nightshade Arcade. Also functions as a coupon!",
  },

  // Basic tier
  "Apple Pie": {
    description: "A delicious homemade apple pie from the Nightshade Arcade.",
  },
  "Mushroom Soup": {
    description: "A warm and hearty mushroom soup - a specialty of the arcade.",
  },
  "Pumpkin Soup": {
    description: "Creamy pumpkin soup exclusively from the Nightshade Arcade.",
  },
  "Kale Stew": {
    description: "A nutritious kale stew prepared at the Nightshade Arcade.",
  },
  "Roasted Cauliflower": {
    description: "Perfectly roasted cauliflower - an arcade exclusive.",
  },
  "Blueberry Jam": {
    description: "Homemade blueberry jam from the Nightshade Arcade kitchens.",
  },

  // Rare tier
  "Honey Cake": {
    description: "A sweet honey cake with a golden glaze from the arcade.",
  },
  "Mushroom Jacket Potatoes": {
    description: "Jacket potatoes topped with mushroom - arcade specialty.",
  },
  "Kale & Mushroom Pie": {
    description: "A savory pie combining kale and mushrooms - arcade exclusive.",
  },
  "Orange Cake": {
    description: "A zesty orange cake from the Nightshade Arcade bakery.",
  },
  "Sunflower Crunch": {
    description: "A crunchy sunflower snack mix from the arcade.",
  },

  // Epic tier
  "Beetroot Cake": {
    description: "A vibrant beetroot cake - a premium arcade creation.",
  },
  "Carrot Cake": {
    description: "A delightful carrot cake from the Nightshade Arcade.",
  },
  "Pumpkin Cake": {
    description: "A seasonal pumpkin cake exclusive to the arcade.",
  },
  "Cauliflower Cake": {
    description: "A unique cauliflower cake creation from the arcade kitchens.",
  },
  "Wheat Cake": {
    description: "A wholesome wheat cake from the Nightshade Arcade.",
  },

  // Mega tier
  "Apple Juice": {
    description: "Freshly pressed apple juice from the Nightshade Arcade.",
  },
  "Orange Juice": {
    description: "Freshly squeezed orange juice - arcade premium.",
  },
  "Purple Smoothie": {
    description: "A vibrant purple berry smoothie from the arcade.",
  },
  "Banana Blast": {
    description: "An energizing banana smoothie from the Nightshade Arcade.",
  },
};
