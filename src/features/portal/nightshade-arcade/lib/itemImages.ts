/**
 * Portal-specific item images
 * Maps item names to image paths - independent of game ITEM_DETAILS
 */

export const PORTAL_ITEM_IMAGES: Record<string, string> = {
  // Basic items
  "Apple Pie": "/images/apple_pie.png",
  "Mushroom Soup": "/images/mushroom_soup.png",
  "Pumpkin Soup": "/images/pumpkin_soup.png",
  "Kale Stew": "/images/kale_stew.png",
  "Roasted Cauliflower": "/images/roasted_cauliflower.png",
  "Blueberry Jam": "/images/blueberry_jam.png",
  
  // Rare items
  "Honey Cake": "/images/honey_cake.png",
  "Mushroom Jacket Potatoes": "/images/mushroom_jacket_potatoes.png",
  "Kale & Mushroom Pie": "/images/kale_mushroom_pie.png",
  "Orange Cake": "/images/orange_cake.png",
  "Sunflower Crunch": "/images/sunflower_crunch.png",
  
  // Epic items
  "Beetroot Cake": "/images/beetroot_cake.png",
  "Carrot Cake": "/images/carrot_cake.png",
  "Pumpkin Cake": "/images/pumpkin_cake.png",
  "Cauliflower Cake": "/images/cauliflower_cake.png",
  "Wheat Cake": "/images/wheat_cake.png",
  
  // Mega items
  "Apple Juice": "/images/apple_juice.png",
  "Orange Juice": "/images/orange_juice.png",
  "Purple Smoothie": "/images/purple_smoothie.png",
  "Banana Blast": "/images/banana_blast.png",
};

/**
 * Get image for an item by name
 * Returns the image URL or undefined if not found
 */
export const getPortalItemImage = (itemName: string): string | undefined => {
  return PORTAL_ITEM_IMAGES[itemName];
};
