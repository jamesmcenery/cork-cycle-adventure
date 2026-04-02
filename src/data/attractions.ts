import { TILE_SIZE } from '../constants';

export interface Attraction {
  id:          string;
  name:        string;
  shortName:   string;
  description: string;
  emoji:       string;
  tileCol:     number;
  tileRow:     number;
  points:      number;
  stamptint:   number;
  visitMsg:    string;
}

// All attractions sit ON a guaranteed road tile in the 3-spine grid:
//   V1 spine: cols 20-21  |  V2 spine: cols 40-41  |  V3 spine: cols 62-63
//   H1 north: rows  5-6   |  H2 city:  rows 18-19  |  H3 western: rows 35-36
//   Lee spur: cols  8-9,  rows 35-49

export const ATTRACTIONS: Attraction[] = [
  {
    id:          'shandon',
    name:        'Shandon Bells & Tower',
    shortName:   'Shandon',
    description: "Ring the famous bells — 360° views over Cork City.",
    emoji:       '🔔',
    tileCol:     40,  // V2 spine, row 3 — north end of Magazine Road
    tileRow:     3,
    points:      400,
    stamptint:   0xff9f1c,
    visitMsg:    "BONG! BONG! Shandon bells ring for Scott!",
  },
  {
    id:          'gaol',
    name:        'Cork City Gaol',
    shortName:   'City Gaol',
    description: "Spooky 19th-century prison, north of the river.",
    emoji:       '🏰',
    tileCol:     20,  // V1 spine, row 3 — north end of west spine
    tileRow:     3,
    points:      350,
    stamptint:   0x9b2335,
    visitMsg:    "Escaped from Cork City Gaol!",
  },
  {
    id:          'englishmarket',
    name:        'English Market',
    shortName:   'English Market',
    description: "Trading since 1788 — the heart of Cork food culture.",
    emoji:       '🥩',
    tileCol:     40,  // V2 spine, row 16 — city island between channels
    tileRow:     16,
    points:      300,
    stamptint:   0xc77dff,
    visitMsg:    "Grand bit of shopping there, boy!",
  },
  {
    id:          'fitzgeralds',
    name:        "Fitzgerald's Park",
    shortName:   "Fitz's Park",
    description: "Cork's favourite riverside park — statues and ducks.",
    emoji:       '🌳',
    tileCol:     20,  // V1 spine, row 25 — V1 cutting through the park
    tileRow:     25,
    points:      250,
    stamptint:   0x52b788,
    visitMsg:    "Lovely day for a ride in the park!",
  },
  {
    id:          'fota',
    name:        'Fota Wildlife Park',
    shortName:   'Fota',
    description: "100 acres of wild animals — giraffes, cheetahs and more.",
    emoji:       '🦒',
    tileCol:     62,  // V3 spine × H2 city road intersection
    tileRow:     18,
    points:      450,
    stamptint:   0xfb5607,
    visitMsg:    "The giraffes wave at Scott!",
  },
  {
    id:          'ucc',
    name:        'University College Cork',
    shortName:   'UCC',
    description: "Ireland's oldest university — gorgeous limestone quads.",
    emoji:       '🎓',
    tileCol:     40,  // V2 spine, row 50 — south end
    tileRow:     50,
    points:      300,
    stamptint:   0x4361ee,
    visitMsg:    "Go Leesiders! UCC stamp collected!",
  },
  {
    id:          'leefields',
    name:        'Lee Fields',
    shortName:   'Lee Fields',
    description: "Wide open flood plains beside the River Lee.",
    emoji:       '🌿',
    tileCol:     8,   // Lee Fields spur, row 43
    tileRow:     43,
    points:      200,
    stamptint:   0x95d5b2,
    visitMsg:    "Fresh air from the Lee — deadly!",
  },
  {
    id:          'blarney',
    name:        'Blarney Castle',
    shortName:   'Blarney',
    description: "Kiss the Blarney Stone and get the gift of the gab.",
    emoji:       '🏯',
    tileCol:     5,   // H3 western road, far west end
    tileRow:     35,
    points:      500,
    stamptint:   0x606c38,
    visitMsg:    "The gift of the gab — acquired!",
  },
];

export function attractionWorldX(a: Attraction): number {
  return a.tileCol * TILE_SIZE + TILE_SIZE / 2;
}
export function attractionWorldY(a: Attraction): number {
  return a.tileRow * TILE_SIZE + TILE_SIZE / 2;
}
