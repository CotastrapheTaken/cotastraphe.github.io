import { INITIAL_TILE_SIZE,
        INITIAL_TIME_LIMIT,
        TIME_DECREMENT_PER_LEVEL,
        TILE_DECREMENT_PER_LEVEL
        }
        from "./config.js";

export function getLevelSettings(currentLevel, isNewLevel) {
  if (isNewLevel) {
    currentLevel++;
    const TILE_SIZE = Math.max(8, INITIAL_TILE_SIZE - (currentLevel - 1) * TILE_DECREMENT_PER_LEVEL);
    const TIME_LIMIT = Math.max(10, INITIAL_TIME_LIMIT - (currentLevel - 1) * TIME_DECREMENT_PER_LEVEL);
    return { currentLevel, TILE_SIZE, TIME_LIMIT };
  } else {
    return { currentLevel: 1, TILE_SIZE: INITIAL_TILE_SIZE, TIME_LIMIT: INITIAL_TIME_LIMIT };
  }
}