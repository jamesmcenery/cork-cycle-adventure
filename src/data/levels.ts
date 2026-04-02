export interface ChaserDef {
  key:       string;
  name:      string;
  catchMsg:  string;
  startCol:  number;
  startRow:  number;
  speed:     number;
  mapTint:   number;  // colour on minimap
}

export interface LevelConfig {
  level:         number;
  name:          string;
  subtitle:      string;
  attractionIds: string[];
  chasers:       ChaserDef[];
  hasRivers:     boolean;
  cameraZoom:    number;
}

// Base speed: 90 px/s
// Mam/Dad ≈ 1× · Finn/Culann = 1.5× · James/Therese = 2×
const S  = 90;   // mam
const SD = 85;   // dad (slightly slower)
const SF = Math.round(S * 1.5);  // finn / culann
const SJ = S * 2;                // james / therese

export const LEVELS: LevelConfig[] = [
  {
    level:    1,
    name:     'Level 1',
    subtitle: 'A Grand Day Out',
    attractionIds: ['shandon', 'englishmarket', 'fitzgeralds', 'ucc'],
    chasers:  [],
    hasRivers: false,
    cameraZoom: 1.8,
  },
  {
    level:    2,
    name:     'Level 2',
    subtitle: "Mam's on the Warpath",
    attractionIds: ['shandon', 'gaol', 'englishmarket', 'fitzgeralds', 'ucc', 'leefields', 'blarney', 'fota'],
    hasRivers: true,
    cameraZoom: 1.4,
    chasers: [
      { key: 'chaser_mam', name: 'Mam (Esther)',   catchMsg: "Scott! Home NOW — homework time!",                startCol: 20, startRow:  3, speed: S,  mapTint: 0xe63946 },
      { key: 'chaser_dad', name: 'Dad (Cillian)',   catchMsg: "Get home, son! The dinner's on the table!",       startCol: 62, startRow: 50, speed: SD, mapTint: 0x2a78c7 },
    ],
  },
  {
    level:    3,
    name:     'Level 3',
    subtitle: 'Family Panic',
    attractionIds: ['shandon', 'gaol', 'englishmarket', 'fitzgeralds', 'fota', 'ucc', 'leefields', 'stfinbarres', 'blackrock', 'blarney'],
    hasRivers: true,
    cameraZoom: 1.4,
    chasers: [
      { key: 'chaser_mam',    name: 'Mam (Esther)',      catchMsg: "Scott! Home NOW — homework time!",                startCol: 20, startRow:  3, speed: S,  mapTint: 0xe63946 },
      { key: 'chaser_dad',    name: 'Dad (Cillian)',      catchMsg: "Get home, son! The dinner's on the table!",       startCol: 62, startRow: 50, speed: SD, mapTint: 0x2a78c7 },
      { key: 'chaser_finn',   name: 'Finn (Big Bro)',     catchMsg: "Mam is going MENTAL — come home!",                startCol: 40, startRow: 55, speed: SF, mapTint: 0x3a86ff },
      { key: 'chaser_culann', name: 'Culann (Oldest Bro)',catchMsg: "Seriously Scott, get in!",                        startCol:  5, startRow: 18, speed: SF, mapTint: 0x2d6a4f },
    ],
  },
  {
    level:    4,
    name:     'Level 4',
    subtitle: 'Maximum Chaos',
    attractionIds: ['shandon', 'gaol', 'englishmarket', 'fitzgeralds', 'fota', 'ucc', 'leefields', 'stfinbarres', 'blackrock', 'blarney', 'pairc', 'thelough'],
    hasRivers: true,
    cameraZoom: 1.4,
    chasers: [
      { key: 'chaser_mam',    name: 'Mam (Esther)',      catchMsg: "Scott! Home NOW — homework time!",                startCol: 20, startRow:  3, speed: S,  mapTint: 0xe63946 },
      { key: 'chaser_dad',    name: 'Dad (Cillian)',      catchMsg: "Get home, son! The dinner's on the table!",       startCol: 62, startRow: 50, speed: SD, mapTint: 0x2a78c7 },
      { key: 'chaser_finn',   name: 'Finn (Big Bro)',     catchMsg: "Mam is going MENTAL — come home!",                startCol: 40, startRow: 55, speed: SF, mapTint: 0x3a86ff },
      { key: 'chaser_culann', name: 'Culann (Oldest Bro)',catchMsg: "Seriously Scott, get in!",                        startCol:  5, startRow: 18, speed: SF, mapTint: 0x2d6a4f },
      { key: 'chaser_uncle',  name: 'Uncle James',        catchMsg: "Your mam sent me to find you, boy!",              startCol:  8, startRow: 42, speed: SJ, mapTint: 0x8338ec },
      { key: 'chaser_auntie', name: 'Auntie Therese',     catchMsg: "Scott! You've school in the morning!",            startCol: 62, startRow:  5, speed: SJ, mapTint: 0xe07a5f },
    ],
  },
];

export function getLevelConfig(level: number): LevelConfig {
  return LEVELS[Math.min(level, LEVELS.length) - 1];
}

export const MAX_LEVEL = LEVELS.length;
