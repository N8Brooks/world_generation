import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";

/** Used to adjust frequency. */
const SCALE = 0.007;

/** Number of iterations to process result for. */
const OCTAVES = 8;

/** Scale factor each iteration */
const PERSISTANCE = 0.5;

/** Used to scale a number `-1 <= x <= 1` to `0 <= x <= 255`. */
const GRAY_SCALE = 127.5;

/** Simplex noise function. */
const simplexNoise = makeNoise2D();

/** Return simplex noise for coordinate. */
export function noise(x: number, y: number): number {
  let maxAmp = 0, result = 0, amp = 1, freq = SCALE;

  for (let i = 0; i < OCTAVES; i++) {
    result += simplexNoise(x * freq, y * freq) * amp;
    maxAmp += amp;
    amp *= PERSISTANCE;
    freq *= 2;
  }

  return GRAY_SCALE * (result / maxAmp + 1);
}
