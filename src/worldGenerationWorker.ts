import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { mulberry32 } from "./random.ts";
import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";
import { WorkerMessageData } from "./WorkerPool.ts";

onmessage = function (
  this: Window,
  message: MessageEvent<WorkerMessageData>,
): void {
  const {
    theme,
    tile: { width, height, x0, y0 },
    simplex: { seed, frequency, octaves, persistance },
    shape: { name, xCenter, yCenter },
  } = message.data;

  // randomization
  const random = mulberry32(seed);
  const noise2D = makeNoise2D(random);

  // shaping
  const makeShape = Shapes[name];
  const shape = makeShape(xCenter, yCenter);

  // coloring
  const { heightToColor } = Themes[theme];

  // simplex matrix
  const totalAmplitude = 2 - 1 / (2 ** (octaves - 1));
  const imageData = new ImageData(width, height);
  const buffer = new Uint32Array(imageData.data.buffer);

  // fill matrix
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      buffer[width * y + x] = ensemble(x, y);
    }
  }

  /** Normalized noise with given shape function. */
  function ensemble(x: number, y: number): number {
    // float where `0 <= value < 2`
    const value = noise(x0 + x, y0 + y) - shape(x0 + x, y0 + y) + 1;
    // integer where `0 <= height < 100`;
    const height = Math.floor(50 * value);
    return heightToColor[height];
  }

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

  postMessage(
    { tile: message.data.tile, imageData },
    [imageData.data.buffer] as WindowPostMessageOptions,
  );
};
