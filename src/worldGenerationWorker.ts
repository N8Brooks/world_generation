import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { mulberry32 } from "./random.ts";
import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";
import { WorkerMessageData } from "./WorkerPool.ts";

onmessage = function (
  this: Window,
  message: MessageEvent<WorkerMessageData>,
): void {
  // unpack message
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
  for (let xd = 0; xd < width; xd++) {
    const x = x0 + xd;
    for (let yd = 0; yd < height; yd++) {
      const y = y0 + yd;

      // generate simplex noise
      let result = 0, amp = 1, freq = frequency;
      for (let octave = 0; octave < octaves; octave++) {
        result += amp * noise2D(x * freq, y * freq);
        amp *= persistance;
        freq *= 2;
      }
      const noise = (1 + result / totalAmplitude) / 2;

      // make color from `0 <= value < 100`
      const value = noise - shape(x, +y) + 1;
      const height = Math.floor(50 * value);

      buffer[width * yd + xd] = heightToColor[height];
    }
  }

  postMessage(
    { tile: message.data.tile, imageData },
    [imageData.data.buffer] as WindowPostMessageOptions,
  );
};
