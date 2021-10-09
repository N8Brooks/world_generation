import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { shapes } from "./shapes.ts";
import { ColorSettings, styles } from "./styles.ts";
import { WorldGenerationOptions } from "./WorldGenerationOptions.ts";

const noise2D = makeNoise2D();

/** Factor to make a world generator function. */
export function makeWorldGenerator(
  options: WorldGenerationOptions,
): (x: number, y: number) => number {
  const {
    style,
    shape,
    octaves,
    frequency,
    persistance,
  } = options;

  const shaper = shapes[shape];
  const heightToColor = makeHeightToColor(styles[style]);
  const totalAmplitude = 2 - 1 / (2 ** (octaves - 1));

  return function (x: number, y: number): number {
    // float where `0 <= value < 2`
    const value = noise(x, y) - shaper(x, y) + 1;
    // integer where `0 <= height < 100`;
    const height = Math.floor(50 * value);
    return heightToColor[height];
  };

  /** Return simplex noise for coordinate where `0 <= x < 1`. */
  function noise(x: number, y: number): number {
    let result = 0, amp = 1, freq = frequency;
    for (let octave = 0; octave < octaves; octave++) {
      result += amp * noise2D(x * freq, y * freq);
      amp *= persistance;
      freq *= 2;
    }
    return (1 + result / totalAmplitude) / 2;
  }
}

/** Creates an `Array` of length 100 containing colors. */
export function makeHeightToColor(colorConfig: ColorSettings[]): number[] {
  colorConfig = [...colorConfig];
  colorConfig.sort((a, b) => a.upperBound - b.upperBound);
  colorConfig.push({ upperBound: 100, rgbColor: [0, 0, 0] });
  const heightToColor: number[] = Array(100);
  let lowerBound = 0;
  for (const { upperBound, rgbColor: [r, g, b] } of colorConfig) {
    const color = rgb(r, g, b);
    heightToColor.fill(color, lowerBound, upperBound + 1);
    lowerBound = upperBound;
  }
  return heightToColor;
}

/** Maps 8-bit rgb values to a 32-bit integer. */
export function rgb(r: number, g: number, b: number): number {
  return r + (g << 8) + (b << 16) + (255 << 24);
}
