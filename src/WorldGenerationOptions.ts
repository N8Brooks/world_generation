import { Shapes } from "./Shapes.ts";
import { Themes } from "./Themes.ts";

/** Options available for `WorldGeneration`. */
export type WorldGenerationOptions = {
  theme: keyof typeof Themes;
  shape: keyof typeof Shapes;
  simplex: SimplexOptions;
};

export type SimplexOptions = {
  frequency: number;
  octaves: number;
  persistance: number;
};
