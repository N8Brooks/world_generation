import { makeNoise2D } from "https://deno.land/x/fast_simplex_noise@v4.0.0/2d.ts";
import { Shapes } from "./shapes.ts";
import { Themes } from "./Themes.ts";

const noise2D = makeNoise2D();

/** Default options for `WorldGeneration`. */
const defaultOptions: WorldGenerationOptions = {
  theme: "pixel",
  shape: "circle",
  simplex: {
    frequency: 0.002,
    octaves: 5,
    persistance: 0.5,
  },
};

/** Options available for `WorldGeneration`. */
export type WorldGenerationOptions = {
  theme: keyof typeof Themes;
  shape: keyof typeof Shapes;
  simplex: {
    frequency: number;
    octaves: number;
    persistance: number;
  };
};

/** Generates a simplex noise world. */
export class WorldGeneration extends HTMLElement {
  declare canvas: HTMLCanvasElement;
  declare context: CanvasRenderingContext2D;
  declare height: number;
  declare width: number;
  declare imageData: ImageData;
  declare options: WorldGenerationOptions;

  /** Adds a canvas with a procedurally generated world. */
  constructor(options: Partial<WorldGenerationOptions> = {}) {
    super();
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.options = { ...defaultOptions, ...options };
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw Error("canvas context identifier not supported");
    }
    this.context = context;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    shadowRoot.append(this.canvas);
    this.render();
  }

  /** Generates image data for the canvas. */
  render() {
    const imageData = new ImageData(this.width, this.height);
    const buffer = new Uint32Array(imageData.data.buffer);

    const centerX = Math.floor(this.canvas.width / 2);
    const centerY = Math.floor(this.canvas.height / 2);
    const maximumDistance = Math.min(centerX, centerY);
    const shape = Shapes[this.options.shape].bind({
      centerX,
      centerY,
      maximumDistance,
    });
    const { heightToColor } = Themes[this.options.theme];
    const { frequency, octaves, persistance } = this.options.simplex;
    const totalAmplitude = 2 - 1 / (2 ** (octaves - 1));

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        buffer[this.width * y + x] = ensemble(x, y);
      }
    }
    this.context.putImageData(imageData, 0, 0);

    /** Normalized noise with given shape function. */
    function ensemble(x: number, y: number): number {
      // float where `0 <= value < 2`
      const value = noise(x, y) - shape(x, y) + 1;
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
  }
}

customElements.define("world-generation", WorldGeneration);
