import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";

/** Settings for simplex noise. */
export type SimplexOptions = {
  seed: number;
  frequency: number;
  octaves: number;
  persistance: number;
};

/** Shape type for land with the coordinates of the center of the island. */
export type ShapeOptions = {
  name: keyof typeof Shapes;
  xCenter: number;
  yCenter: number;
};

/** Options available for `WorldGeneration`. */
export type WorldGenerationOptions = {
  theme: keyof typeof Themes;
  shape: keyof typeof Shapes;
  simplex: SimplexOptions;
};
