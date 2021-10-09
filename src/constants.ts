/** Used to scale `x` and `y` values. */
export const FREQUENCY = 0.002;

/** Number of iterations of simplex noise to use. */
export const OCTAVES = 5;

/** Scale factor each iteration */
export const PERSISTANCE = 0.5;

/** Settings for color configuration. */
export const COLOR_CONFIG = [
  { upperBound: 26, r: 1, g: 49, b: 99 }, // water 6
  { upperBound: 30, r: 0, g: 62, b: 125 }, // water 5
  { upperBound: 34, r: 0, g: 70, b: 139 }, // water 4
  { upperBound: 38, r: 1, g: 84, b: 168 }, // water 3
  { upperBound: 42, r: 0, g: 94, b: 189 }, // water 2
  { upperBound: 45, r: 0, g: 106, b: 212 }, // water 1
  { upperBound: 50, r: 1, g: 118, b: 237 }, // water 0
  { upperBound: 53, r: 237, g: 195, b: 154 }, // sand
  { upperBound: 56, r: 43, g: 144, b: 0 }, // grass
  { upperBound: 58, r: 36, g: 128, b: 47 }, // light trees
  { upperBound: 64, r: 22, g: 89, b: 32 }, // dark trees
  { upperBound: 70, r: 122, g: 122, b: 122 }, // dark rock
  { upperBound: 75, r: 143, g: 143, b: 143 }, // light rock
  { upperBound: 80, r: 204, g: 204, b: 204 }, // dark snow
  { upperBound: 100, r: 255, g: 255, b: 255 }, // light snow
];
