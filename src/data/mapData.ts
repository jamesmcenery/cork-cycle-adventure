import { TILE, MAP_COLS, MAP_ROWS } from '../constants';

// ─────────────────────────────────────────────────────────────────────────────
// Cork City map  —  80 cols × 60 rows × 64 px
//
// THREE-SPINE GRID — every attraction is guaranteed ON a road tile.
//
// Draw order:  BUILDINGS → PARKS (override) → WATER → ROADS (last, win all)
//
// Vertical spines (N-S, full height):
//   V1  cols 20-21  (west spine)
//   V2  cols 40-41  (Magazine Road — centre spine)
//   V3  cols 62-63  (east spine)
//
// Horizontal crossroads (E-W, full width):
//   H1  rows  5-6   (north road — MacCurtain St area)
//   H2  rows 18-19  (city road  — Grand Parade area)
//   H3  rows 35-36  (western road)
//
// Water channels (roads drawn LAST → automatic bridges):
//   North Channel  rows  9-10
//   South Channel  rows 13-14
//
// Lee Fields spur:  cols 8-9, rows 35-49
// ─────────────────────────────────────────────────────────────────────────────

export function generateCorkMap(): number[][] {
  const map: number[][] = Array.from(
    { length: MAP_ROWS },
    () => new Array(MAP_COLS).fill(TILE.GRASS),
  );

  function fill(col: number, row: number, w: number, h: number, tile: number) {
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) {
          map[r][c] = tile;
        }
      }
    }
  }

  // ── 1. BUILDINGS — fill four bands between spines ─────────────────────────
  // Band A: cols 0-19  (west of V1)
  // Band B: cols 22-39 (between V1 and V2)
  // Band C: cols 42-61 (between V2 and V3)
  // Band D: cols 64-79 (east of V3)
  //
  // Row sections between crossroads / water:
  //   rows  0-4   north cap
  //   rows  7-8   gap between H1 and North Channel
  //   rows 11-12  city island (between channels)
  //   rows 15-17  gap between South Channel and H2
  //   rows 20-34  mid section
  //   rows 37-55  south section
  //   rows 56-59  south boundary wall

  const bands: [number, number][] = [[0,20],[22,18],[42,20],[64,16]];
  const sections: [number, number][] = [[0,5],[7,2],[11,2],[15,3],[20,15],[37,19]];

  for (const [bc, bw] of bands) {
    for (const [sr, sh] of sections) {
      fill(bc, sr, bw, sh, TILE.BUILDING);
    }
  }
  fill(0, 56, 80, 4, TILE.BUILDING);  // south boundary wall

  // ── 2. PARKS — override buildings in green areas ──────────────────────────

  // Fitzgerald's Park — west side, mid section (V1 spine will cut through as road)
  fill(13, 21, 9, 12, TILE.PARK);
  fill(15, 23, 4,  3, TILE.DIRT);    // gravel path to skate park
  // Skate park — concrete area in south end of Fitz's Park (cols 14-18, rows 27-30)
  fill(14, 27, 5,  4, TILE.PLAZA);

  // Lee Fields — south-west (Lee spur will cut through as road)
  fill(3, 37, 18, 18, TILE.PARK);
  fill(7, 40,  3, 10, TILE.DIRT);    // flood plain track

  // UCC grounds — centre-south (V2 spine will cut through as road)
  fill(34, 44, 14, 10, TILE.PARK);
  fill(36, 46,  8,  6, TILE.PLAZA);  // quads

  // Fota Wildlife Park — east side (V3 spine will cut through as road)
  fill(54, 14, 10,  9, TILE.PARK);

  // Small city squares
  fill(27,  0,  6,  5, TILE.PARK);   // tiny north square
  fill(68,  0,  8,  5, TILE.PARK);   // north-east green

  // ── 3. WATER — drawn after parks so water always shows ───────────────────
  fill(0,  9, MAP_COLS, 2, TILE.WATER);  // North Channel rows  9-10
  fill(0, 13, MAP_COLS, 2, TILE.WATER);  // South Channel rows 13-14

  // ── 4. ROADS — drawn LAST, override everything inc. water ─────────────────

  // N-S spines (full height — creates automatic bridges over water)
  fill(20, 0, 2, MAP_ROWS, TILE.ROAD);  // V1 west spine
  fill(40, 0, 2, MAP_ROWS, TILE.ROAD);  // V2 Magazine Road (centre)
  fill(62, 0, 2, MAP_ROWS, TILE.ROAD);  // V3 east spine

  // E-W crossroads (full width — creates automatic bridges over water)
  fill(0,  5, MAP_COLS, 2, TILE.ROAD);  // H1 north road  (MacCurtain St area)
  fill(0, 18, MAP_COLS, 2, TILE.ROAD);  // H2 city road   (Grand Parade area)
  fill(0, 35, MAP_COLS, 2, TILE.ROAD);  // H3 western road

  // Lee Fields spur — south from H3 (rows 35-36 already covered by H3)
  fill(8, 35, 2, 15, TILE.ROAD);        // cols 8-9, rows 35-49

  return map;
}

// ── Jump-ramp zones ────────────────────────────────────────────────────────────
export const RAMP_ZONES = [
  // Skate park at Fitzgerald's Park — 4 ramps clustered on the plaza tiles
  { col: 14, row: 27, label: 'Skate Park Half-pipe N' },
  { col: 16, row: 27, label: 'Skate Park Half-pipe S' },
  { col: 14, row: 29, label: 'Skate Park Quarter L'   },
  { col: 17, row: 29, label: 'Skate Park Quarter R'   },
  // Road ramps
  { col: 40, row: 25, label: 'Magazine Rd Ramp'       },
  { col:  8, row: 43, label: 'Lee Fields Ramp'        },
  { col: 62, row: 22, label: 'East Side Ramp'         },
  { col: 40, row: 47, label: 'UCC Ramp'               },
];
