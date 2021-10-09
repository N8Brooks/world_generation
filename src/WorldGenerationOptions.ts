import { shapes } from "./shapes.ts";
import { styles } from "./styles.ts";

export type WorldGenerationOptions = {
  style: keyof typeof styles;
  shape: keyof typeof shapes;
  frequency: number;
  octaves: number;
  persistance: number;
};
