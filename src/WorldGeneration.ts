import { MAX_32_BIT_INTEGER } from "./random.ts";
import { Tile } from "./Tile.ts";
import { Pool } from "./Pool.ts";
import { WorldGenerationOptions } from "./WorldGenerationOptions.ts";

/** Parameter to break screen into grid. */
const ROWS = 3;

/** Parameter to break screen into grid. */
const COLS = 4;

/** Amount of web workers to use. */
const NUM_WORKERS = navigator.hardwareConcurrency || 2;

/** Default options for `WorldGeneration`. */
const defaultOptions: WorldGenerationOptions = {
  theme: "pixel",
  shape: "circle",
  simplex: {
    frequency: 0.002,
    octaves: 5,
    persistance: 0.5,
    get seed(): number {
      return Math.floor(Math.random() * MAX_32_BIT_INTEGER);
    },
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
    this.options = { ...defaultOptions, ...options };
    this.tiles = [...Tile.tessellate([ROWS, COLS], [this.width, this.height])];
    this.pool = new Pool(NUM_WORKERS, "worker.js");

    this.render();
  }

  /** Generates image data for the canvas. */
  render() {
    const {
      theme,
      shape: name,
      simplex: { ...simplex },
    } = this.options;

    const shape = {
      name,
      xCenter: Math.floor(this.width / 2),
      yCenter: Math.floor(this.height / 2),
    };

    const promises = this.tiles.map((tile) =>
      this.pool.addWork({
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
}

customElements.define("world-generation", WorldGeneration);
