import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";

/** Used to scale `x` and `y` values. */
const FREQUENCY = 0.002;

/** Number of iterations of simplex noise to use. */
const OCTAVES = 5;

/** Scale factor each iteration */
const PERSISTANCE = 0.5;

/** Settings for color configuration. */
const COLOR_CONFIG = [
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

/** Maps numbers where `0 <= height < 100` to colors. */
const heightToColor = processColorConfig(COLOR_CONFIG);

console.log(heightToColor);

/** Used to calculate the average amplitude throughout octaves. */
const totalAmplitude = 2 - 1 / (2 ** (OCTAVES - 1));

/** Vertical center of screen. */
const centerY = Math.floor(window.innerHeight / 2);

/** Horizontal center of screen. */
const centerX = Math.floor(window.innerWidth / 2);

/** Minimum distance to wall from center. */
const distanceToWall = Math.min(centerX, centerY);

/** Simplex noise function. */
const simplexNoise = makeNoise2D();

/** Returns a number where `0 <= x <= 1` where lower values make a pyramid in the middle. */
export function square(x: number, y: number): number {
  const distanceX = Math.abs(x - centerX);
  const distanceY = Math.abs(y - centerY);
  const minimumDistance = Math.max(distanceX, distanceY);
  return Math.min(1, minimumDistance / distanceToWall);
}

/** Returns a number where `0 <= x <= 1` where lower values make a cone in the middle. */
export function circle(x: number, y: number): number {
  const distanceX = x - centerX;
  const distanceY = y - centerY;
  const distance = Math.hypot(distanceX, distanceY);
  return Math.min(1, distance / distanceToWall);
}

/** Return simplex noise for coordinate where `0 <= x < 1`. */
export function noise(x: number, y: number): number {
  let result = 0, amplitude = 1, frequency = FREQUENCY;
  for (let octave = 0; octave < OCTAVES; octave++) {
    result += amplitude * simplexNoise(x * frequency, y * frequency);
    amplitude *= PERSISTANCE;
    frequency *= 2;
  }
  return (1 + result / totalAmplitude) / 2;
}

/** Combination of `noise()` and a shape function resulting in a value where `0 <= x < 1`. */
export function ensemble(x: number, y: number): number {
  // float where `0 <= value < 2`
  const value = (noise(x, y) - circle(x, y) + 1);
  // integer where `0 <= height < 100`;
  const height = Math.floor(50 * value);
  return heightToColor[height];
}

/** Maps 8-bit rgba values to a 32-bit integer. */
export function rgba(r: number, g: number, b: number, a = 255): number {
  return r + (g << 8) + (b << 16) + (a << 24);
}

type ColorSettings = {
  upperBound: number;
  r: number;
  g: number;
  b: number;
  a?: number;
};

/** Creates an `Array` of length 100 containing colors. */
export function processColorConfig(colorConfig: ColorSettings[]): number[] {
  colorConfig = [...colorConfig];
  colorConfig.sort((a, b) => a.upperBound - b.upperBound);
  console.log(colorConfig);
  colorConfig.push({ upperBound: 100, r: 0, g: 0, b: 0 });
  const heightToColor: number[] = Array(100);
  let lowerBound = 0;
  for (const { upperBound, r, g, b, a } of colorConfig) {
    const color = rgba(r, g, b, a);
    heightToColor.fill(color, lowerBound, upperBound + 1);
    lowerBound = upperBound;
  }
  return heightToColor;
}
