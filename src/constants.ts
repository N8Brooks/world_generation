/** Used to scale `x` and `y` values. */
export const FREQUENCY = 0.002;

/** Number of iterations of simplex noise to use. */
export const OCTAVES = 5;

/** Scale factor each iteration */
export const PERSISTANCE = 0.5;

/** Type for color config. */
export type ColorSettings = {
  upperBound: number;
  rgbColor: [number, number, number];
};

/** Settings for color configuration. */
const PIXEL_COLOR_CONFIG: ColorSettings[] = [
  { upperBound: 26, rgbColor: [1, 49, 99] }, // water 6
  { upperBound: 30, rgbColor: [0, 62, 125] }, // water 5
  { upperBound: 34, rgbColor: [0, 70, 139] }, // water 4
  { upperBound: 38, rgbColor: [1, 84, 168] }, // water 3
  { upperBound: 42, rgbColor: [0, 94, 189] }, // water 2
  { upperBound: 45, rgbColor: [0, 106, 212] }, // water 1
  { upperBound: 50, rgbColor: [1, 118, 237] }, // water 0
  { upperBound: 53, rgbColor: [237, 195, 154] }, // sand
  { upperBound: 56, rgbColor: [43, 144, 0] }, // grass
  { upperBound: 58, rgbColor: [36, 128, 47] }, // light trees
  { upperBound: 64, rgbColor: [22, 89, 32] }, // dark trees
  { upperBound: 70, rgbColor: [122, 122, 122] }, // dark rock
  { upperBound: 75, rgbColor: [143, 143, 143] }, // light rock
  { upperBound: 80, rgbColor: [204, 204, 204] }, // dark snow
  { upperBound: 100, rgbColor: [255, 255, 255] }, // light snow
];

export const COLOR_CONFIG = PIXEL_COLOR_CONFIG;
