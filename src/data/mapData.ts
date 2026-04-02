import { TILE, MAP_COLS, MAP_ROWS } from '../constants';

// ─────────────────────────────────────────────────────────────────────────────
// Cork City maps  —  80 cols × 60 rows × 64 px
//
// All 4 levels share the same road skeleton (guaranteed navigable):
//   V1 cols 20-21 · V2 cols 40-41 (Magazine Rd) · V3 cols 62-63
//   H1 rows  5-6  · H2 rows 18-19 (Grand Parade) · H3 rows 35-36 (Western Rd)
//   North Channel rows 9-10 · South Channel rows 13-14
//   Lee spur cols 8-9, rows 35-49
//
// What differs per level:
//   Level 1 – Lush Cork: large parks, generous green space
//   Level 2 – Urban Cork: medium parks, cobblestone city centre
//   Level 3 – Dense Cork: small parks, cobblestone throughout + new landmarks
//   Level 4 – Maximum Chaos: minimal parks, cobblestone/plaza everywhere
// ─────────────────────────────────────────────────────────────────────────────

export function generateMap(level: number): number[][] {
  const map: number[][] = Array.from(
    { length: MAP_ROWS },
    () => new Array(MAP_COLS).fill(TILE.GRASS),
  );

  function fill(col: number, row: number, w: number, h: number, tile: number) {
    for (let r = row; r < row + h; r++) {
      for (let c = col; c < col + w; c++) {
        if (r >= 0 && r < MAP_ROWS && c >= 0 && c < MAP_COLS) map[r][c] = tile;
      }
    }
  }

  // ── 1. BUILDINGS — same for all levels ───────────────────────────────────
  const bands: [number, number][]    = [[0,20],[22,18],[42,20],[64,16]];
  const sections: [number, number][] = [[0,5],[7,2],[11,2],[15,3],[20,15],[37,19]];
  for (const [bc, bw] of bands) for (const [sr, sh] of sections) fill(bc, sr, bw, sh, TILE.BUILDING);
  fill(0, 56, 80, 4, TILE.BUILDING);

  // ── 2. PARKS — varies by level ───────────────────────────────────────────

  if (level === 1) {
    // Lush: big parks everywhere
    fill(13, 21,  9, 12, TILE.PARK);   // Fitz's Park large
    fill(15, 23,  4,  3, TILE.DIRT);
    fill(14, 27,  5,  4, TILE.PLAZA);  // skate park
    fill( 3, 37, 18, 18, TILE.PARK);   // Lee Fields large
    fill( 7, 40,  3, 10, TILE.DIRT);
    fill(34, 44, 14, 10, TILE.PARK);   // UCC grounds
    fill(36, 46,  8,  6, TILE.PLAZA);
    fill(54, 14, 10,  9, TILE.PARK);   // Fota
    fill(27,  0,  6,  5, TILE.PARK);
    fill(68,  0,  8,  5, TILE.PARK);

  } else if (level === 2) {
    // Medium parks, cobblestone city island
    fill(14, 22,  7, 10, TILE.PARK);   // Fitz's Park medium
    fill(15, 23,  4,  2, TILE.DIRT);
    fill(14, 27,  5,  4, TILE.PLAZA);  // skate park
    fill( 3, 38, 14, 15, TILE.PARK);   // Lee Fields medium
    fill( 7, 40,  2,  8, TILE.DIRT);
    fill(34, 44, 10,  8, TILE.PARK);   // UCC reduced
    fill(36, 46,  6,  4, TILE.PLAZA);
    fill(55, 15,  8,  7, TILE.PARK);   // Fota medium
    fill(27,  0,  5,  4, TILE.PARK);
    // Cobblestone city island
    fill( 5, 11, 15,  2, TILE.COBBLESTONE);
    fill(22, 17, 16,  2, TILE.COBBLESTONE);
    fill(43, 15,  6,  2, TILE.COBBLESTONE);

  } else if (level === 3) {
    // Small parks, heavy cobblestone, new landmark contexts
    fill(15, 23,  4,  6, TILE.PARK);   // Fitz's Park small
    fill(14, 27,  5,  4, TILE.PLAZA);  // skate park
    fill( 4, 39, 10, 10, TILE.PARK);   // Lee Fields small
    fill(35, 45,  8,  6, TILE.PARK);   // UCC small
    fill(36, 46,  6,  4, TILE.PLAZA);
    fill(56, 15,  6,  6, TILE.PARK);   // Fota small
    // Cobblestone city island and south bank
    fill( 5, 11, 15,  2, TILE.COBBLESTONE);
    fill(22, 11, 16,  2, TILE.COBBLESTONE);
    fill(43, 11,  6,  2, TILE.COBBLESTONE);
    fill( 5, 15, 15,  3, TILE.COBBLESTONE);
    fill(22, 15, 16,  3, TILE.COBBLESTONE);
    fill(43, 15,  6,  3, TILE.COBBLESTONE);
    fill(22, 20, 16,  6, TILE.COBBLESTONE);  // between Grand Parade and Western Rd
    // St Fin Barre's cathedral grounds (below Western Rd on V2)
    fill(37, 37,  8,  5, TILE.PLAZA);
    // Blackrock riverside park (V3 south)
    fill(59, 43,  8,  6, TILE.PARK);
    // The Lough (V1 south)
    fill(16, 43,  8,  7, TILE.PARK);

  } else {
    // Level 4: Minimal parks, dense urban cobblestone
    fill(14, 27,  5,  4, TILE.PLAZA);  // skate park only — no surrounding park
    fill( 5, 40,  6,  5, TILE.PARK);   // token Lee Fields
    fill(36, 46,  6,  4, TILE.PLAZA);  // UCC quads only
    // Heavy cobblestone city core
    fill( 5, 11, 15,  2, TILE.COBBLESTONE);
    fill(22, 11, 16,  2, TILE.COBBLESTONE);
    fill(43, 11,  6,  2, TILE.COBBLESTONE);
    fill( 5, 15, 15,  3, TILE.COBBLESTONE);
    fill(22, 15, 16,  3, TILE.COBBLESTONE);
    fill(43, 15,  6,  3, TILE.COBBLESTONE);
    fill(22, 20, 16, 12, TILE.COBBLESTONE);
    fill( 0, 20, 20,  6, TILE.COBBLESTONE);
    fill(43, 20, 18,  6, TILE.COBBLESTONE);
    fill(64, 20, 16,  6, TILE.COBBLESTONE);
    // St Fin Barre's
    fill(37, 37,  8,  5, TILE.PLAZA);
    // Blackrock
    fill(59, 43,  8,  6, TILE.PARK);
    // Páirc Uí Chaoimh — cobblestone stadium
    fill(58, 49,  8,  7, TILE.COBBLESTONE);
    fill(60, 50,  5,  5, TILE.PLAZA);
    // The Lough
    fill(16, 43,  8,  7, TILE.PARK);
    // Sidewalk throughout mid-city
    fill( 0, 37, 20,  2, TILE.SIDEWALK);
    fill(22, 37, 18,  2, TILE.SIDEWALK);
    fill(43, 37, 19,  2, TILE.SIDEWALK);
    fill(64, 37, 16,  2, TILE.SIDEWALK);
  }

  // ── 3. WATER — level 2+ only (level 1 is river-free) ────────────────────
  if (level >= 2) {
    fill(0,  9, MAP_COLS, 2, TILE.WATER);
    fill(0, 13, MAP_COLS, 2, TILE.WATER);
  }

  // ── 4. ROADS — drawn LAST, override everything ────────────────────────────
  fill(20, 0, 2, MAP_ROWS, TILE.ROAD);
  fill(40, 0, 2, MAP_ROWS, TILE.ROAD);
  fill(62, 0, 2, MAP_ROWS, TILE.ROAD);
  fill(0,  5, MAP_COLS, 2, TILE.ROAD);
  fill(0, 18, MAP_COLS, 2, TILE.ROAD);
  fill(0, 35, MAP_COLS, 2, TILE.ROAD);
  fill(8, 35, 2, 15, TILE.ROAD);   // Lee spur

  return map;
}

// Backwards-compat alias used during development
export const generateCorkMap = () => generateMap(1);

// ── Jump-ramp zones (same for all levels) ─────────────────────────────────────
export const RAMP_ZONES = [
  { col: 14, row: 27, label: 'Skate Park Half-pipe N' },
  { col: 16, row: 27, label: 'Skate Park Half-pipe S' },
  { col: 14, row: 29, label: 'Skate Park Quarter L'   },
  { col: 17, row: 29, label: 'Skate Park Quarter R'   },
  { col: 40, row: 25, label: 'Magazine Rd Ramp'       },
  { col:  8, row: 43, label: 'Lee Fields Ramp'        },
  { col: 62, row: 22, label: 'East Side Ramp'         },
  { col: 40, row: 47, label: 'UCC Ramp'               },
];
