export const GAME_WIDTH  = 960;
export const GAME_HEIGHT = 640;
export const TILE_SIZE   = 64;
export const MAP_COLS    = 80;
export const MAP_ROWS    = 60;
export const WORLD_WIDTH  = MAP_COLS * TILE_SIZE;  // 5120
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE;  // 3840

// Tile indices (must match TextureFactory tileset order)
export const TILE = {
  GRASS:       0,
  ROAD:        1,
  CYCLE_PATH:  2,
  PARK:        3,
  BUILDING:    4,  // solid — collision
  WATER:       5,  // solid — collision
  COBBLESTONE: 6,
  DIRT:        7,
  PLAZA:       8,
  SIDEWALK:    9,
} as const;

// Speed multipliers per tile type (applied in Bike.update)
export const TILE_SPEED: Record<number, number> = {
  [TILE.GRASS]:       0.70,
  [TILE.ROAD]:        1.00,
  [TILE.CYCLE_PATH]:  1.10,
  [TILE.PARK]:        0.75,
  [TILE.BUILDING]:    1.00,
  [TILE.WATER]:       1.00,
  [TILE.COBBLESTONE]: 0.85,
  [TILE.DIRT]:        0.60,
  [TILE.PLAZA]:       0.95,
  [TILE.SIDEWALK]:    0.80,
};

export const SCENE = {
  BOOT:       'BootScene',
  TITLE:      'TitleScene',
  SHOP:       'ShopScene',
  GAME:       'GameScene',
  UI:         'UIScene',
  PASSPORT:   'PassportScene',
} as const;

// Magazine Road (cols 40-41), south of the junctions — The Bike Shed area
export const SCOTT_START_WORLD_X = 40 * TILE_SIZE + TILE_SIZE / 2;  // 2592
export const SCOTT_START_WORLD_Y = 44 * TILE_SIZE + TILE_SIZE / 2;  // 2848
