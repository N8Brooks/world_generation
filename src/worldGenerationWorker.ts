import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { setDimensions, Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";
import { InputData } from "./WorkerPool.ts";

onmessage = function (this: Window, message: MessageEvent<InputData>): void {
  const {
    window,
    theme,
    seeds,
    rectangle: { width, height, x0, y0 },
    shape: shapeType,
    simplex: { frequency, octaves, persistance },
  } = message.data;

  let i = 0;
  const noise2D = makeNoise2D(() => seeds[i++]);

  setDimensions(window);
  const shape = Shapes[shapeType];
  const totalAmplitude = 2 - 1 / (2 ** (octaves - 1));
  const imageData = new ImageData(width, height);
  const buffer = new Uint32Array(imageData.data.buffer);
  const { heightToColor } = Themes[theme];

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
    { rectangle: message.data.rectangle, imageData },
    [imageData.data.buffer] as WindowPostMessageOptions,
  );
};
