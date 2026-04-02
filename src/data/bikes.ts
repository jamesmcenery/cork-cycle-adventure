export interface BikeConfig {
  id:               string;
  name:             string;
  description:      string;
  price:            string;
  maxSpeed:         number;
  acceleration:     number;
  turnRate:         number;
  drag:             number;
  trickMultiplier:  number;
  frameColor:       number;  // 0xRRGGBB
  accentColor:      number;
  specialAbility:   string;
}

export const BIKE_CONFIGS: Record<string, BikeConfig> = {
  bmx: {
    id:              'bmx',
    name:            'BMX Blaster',
    description:     'Tight turns, huge air — built for tricks.',
    price:           '€ 349',
    maxSpeed:        240,
    acceleration:    9,
    turnRate:        4.2,
    drag:            0.955,
    trickMultiplier: 2.5,
    frameColor:      0xe63946,
    accentColor:     0xffd60a,
    specialAbility:  'Double trick score on ramps',
  },
  mountain: {
    id:              'mountain',
    name:            'Trail Crusher',
    description:     'Goes anywhere — grass, gravel, mud.',
    price:           '€ 549',
    maxSpeed:        210,
    acceleration:    7,
    turnRate:        3.6,
    drag:            0.950,
    trickMultiplier: 1.4,
    frameColor:      0x2d6a4f,
    accentColor:     0x95d5b2,
    specialAbility:  'No off-road speed penalty',
  },
  racer: {
    id:              'racer',
    name:            'Road Rocket',
    description:     'Fastest on tarmac, sticks to road.',
    price:           '€ 799',
    maxSpeed:        360,
    acceleration:    11,
    turnRate:        2.4,
    drag:            0.968,
    trickMultiplier: 0.9,
    frameColor:      0xffd60a,
    accentColor:     0x000000,
    specialAbility:  'Turbo sprint on cycle paths',
  },
  cargo: {
    id:              'cargo',
    name:            'Haul-It',
    description:     'Slow but mighty — cargo challenges await.',
    price:           '€ 649',
    maxSpeed:        155,
    acceleration:    5,
    turnRate:        2.8,
    drag:            0.930,
    trickMultiplier: 0.6,
    frameColor:      0xf4a261,
    accentColor:     0x264653,
    specialAbility:  'Unlocks cargo mini-events',
  },
  electric: {
    id:              'electric',
    name:            'Sparky E-Bike',
    description:     'Silent, quick, and eco-friendly.',
    price:           '€ 999',
    maxSpeed:        295,
    acceleration:    13,
    turnRate:        3.0,
    drag:            0.960,
    trickMultiplier: 1.2,
    frameColor:      0xffffff,
    accentColor:     0x00b4d8,
    specialAbility:  'Auto-assist on hills',
  },
};

export const BIKE_ORDER = ['bmx', 'mountain', 'racer', 'cargo', 'electric'] as const;
