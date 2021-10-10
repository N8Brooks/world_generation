/** Amount of 32 bit integers. */
export const MAX_32_BIT_INTEGER = 2 ** 32;

/** Returns a function that generates seeded random values between `0` inclusive and `1` exclusive. */
export function mulberry32(a: number): () => number {
  return function (): number {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / MAX_32_BIT_INTEGER;
  };
}
