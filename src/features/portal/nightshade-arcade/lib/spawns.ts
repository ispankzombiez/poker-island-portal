import { Coordinates } from "../types";

export const getNightshadeArcadeSpawn = (): Coordinates => {
  const randomXOffset = Math.random() * 49; // 263 - 214 = 49
  const randomYOffset = Math.random() * 20; // 470 - 450 = 20

  return {
    x: 214 + randomXOffset, // x: 214 + randomXOffset,
    y: 450 + randomYOffset, // y: 450 + randomYOffset,
  };
};
