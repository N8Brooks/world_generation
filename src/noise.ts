import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";

/** Used to adjust frequency. */
const SCALE = 0.007;

/** Number of iterations to process result for. */
const OCTAVES = 10;

/** Scale factor each iteration */
const PERSISTANCE = 0.5;

/** Used to scale a number `-1 <= x <= 1` to `0 <= x <= 255`. */
const GRAY_SCALE = 127.5;

const height = window.innerHeight;
const halfHeight = Math.floor(height / 2) + height % 2;

const width = window.innerWidth;
const halfWidth = Math.floor(width / 2) + width % 2;

const half = Math.min(halfHeight, halfWidth);

/** Simplex noise function. */
const simplexNoise = makeNoise2D();

/** Returns a number where `0 <= x <= 1` where lower values make a pyramid in the middle. */
export function square(x: number, y: number): number {
  const horizontalDistance = Math.abs(x - halfWidth);
  const verticalDistance = Math.abs(y - halfHeight);
  const minimumDistance = Math.max(horizontalDistance, verticalDistance);
  const result = Math.min(1, minimumDistance / half);
  return result;
}

/** Return simplex noise for coordinate. */
export function noise(x: number, y: number): number {
  let maxAmp = 0, result = 0, amp = 1, freq = SCALE;

  for (let i = 0; i < OCTAVES; i++) {
    result += simplexNoise(x * freq, y * freq) * amp;
    maxAmp += amp;
    amp *= PERSISTANCE;
    freq *= 2;
  }

  result = Math.max(-1, result / maxAmp - square(x, y));

  return GRAY_SCALE * (result + 1);
}
