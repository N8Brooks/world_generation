import { MAX_32_BIT_INTEGER } from "./random.ts";
import { Tile } from "./Tile.ts";
import { Pool } from "./Pool.ts";
import {
  SimplexOptions,
  WorldGenerationOptions,
} from "./world_generation_options.ts";
import { Themes } from "./Themes.ts";
import { Shapes } from "./Shapes.ts";

/** Parameter to break screen into grid. */
const ROWS = 3;

/** Parameter to break screen into grid. */
const COLS = 4;

/** Amount of web workers to use. */
const NUM_WORKERS = navigator.hardwareConcurrency || 2;

/** Default options for `WorldGeneration`. */
const defaultOptions: WorldGenerationOptions = {
  pixels: 1,
  theme: "pixel",
  shape: "circle",
  simplex: {
    frequency: 0.002,
    octaves: 5,
    persistance: 0.5,
    seed: NaN,
  },
};

/** Generates a simplex noise world. */
export class WorldGeneration extends HTMLElement {
  declare canvas: HTMLCanvasElement;
  declare context: CanvasRenderingContext2D;
  declare height: number;
  declare width: number;
  declare options: WorldGenerationOptions;
  declare pool: Pool;
  declare tiles: Tile[];

  /** Adds a canvas with a procedurally generated world. */
  constructor(options: Partial<WorldGenerationOptions> = {}) {
    super();

    // style web component
    this.style.height = "0";
    this.style.display = "block";

    // setup canvas
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.canvas = document.createElement("canvas");
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw Error("canvas context identifier not supported");
    }
    this.context = context;
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    shadowRoot.append(this.canvas);

    // set up properties
    this.tiles = [...Tile.tessellate([ROWS, COLS], [this.width, this.height])];
    this.pool = new Pool(NUM_WORKERS, "worker.js");
    this.options = { ...defaultOptions, ...this.urlOptions, ...options };

    this.render();
  }

  /** Generates image data for the canvas. */
  render() {
    const {
      pixels,
      theme,
      shape: name,
      simplex: { ...simplex },
    } = this.options;

    const shape = {
      name,
      xCenter: Math.floor(this.width / 2),
      yCenter: Math.floor(this.height / 2),
    };

    if (isNaN(simplex.seed)) {
      simplex.seed = Math.floor(Math.random() * MAX_32_BIT_INTEGER);
    }

    const promises = this.tiles.map((tile) =>
      this.pool.addWork({
        pixels,
        tile,
        theme,
        shape,
        simplex,
      })
    );

    Promise.all(promises)
      .then((responses) => {
        for (const { imageData, tile: { x0, y0 } } of responses) {
          this.context.putImageData(imageData, x0, y0);
        }
      })
      .catch((reason) => {
        console.error(reason);
      });
  }

  get urlOptions(): Partial<WorldGenerationOptions> {
    const options: Partial<WorldGenerationOptions> = {};
    const url = new URL(window.location.toString());

    const theme = url.searchParams.get("theme") ?? "";
    if (theme in Themes) {
      options.theme = theme as keyof typeof Themes;
    }

    const shape = url.searchParams.get("shape") ?? "";
    if (shape in Shapes) {
      options.shape = shape as keyof typeof Shapes;
    }

    options.simplex = { ...defaultOptions.simplex };
    for (const key of Object.keys(options.simplex)) {
      const value = parseFloat(url.searchParams.get(key) ?? "");
      if (!isNaN(value)) {
        options.simplex[key as keyof SimplexOptions] = value;
      }
    }

    const pixels = parseFloat(url.searchParams.get("pixels") ?? "");
    if (!isNaN(pixels)) {
      options.pixels = pixels;
    }

    return options;
  }
}

customElements.define("world-generation", WorldGeneration);
