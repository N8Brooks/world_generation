import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { COLOR_CONFIG, FREQUENCY, OCTAVES, PERSISTANCE } from "./constants.ts";

/** Maps numbers where `0 <= height < 100` to colors. */
const heightToColor = processColorConfig(COLOR_CONFIG);

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

export type ColorSettings = {
  upperBound: number;
  r: number;
  g: number;
  b: number;
  a?: number;
};

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

/** Creates an `Array` of length 100 containing colors. */
export function processColorConfig(colorConfig: ColorSettings[]): number[] {
  colorConfig = [...colorConfig];
  colorConfig.sort((a, b) => a.upperBound - b.upperBound);
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
