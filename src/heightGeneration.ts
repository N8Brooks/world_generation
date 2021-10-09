import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";

/** Used to scale `x` and `y` values. */
const FREQUENCY = 0.002;

/** Number of iterations of simplex noise to use. */
const OCTAVES = 10;

/** Scale factor each iteration */
const PERSISTANCE = 0.5;

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
  return (noise(x, y) - circle(x, y) + 1) / 2;
}
