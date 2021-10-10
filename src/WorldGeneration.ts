import { Rectangle } from "./Rectangle.ts";
import { Themes } from "./Themes.ts";
import { WorkerPool } from "./WorkerPool.ts";
import { WorldGenerationOptions } from "./WorldGenerationOptions.ts";

const ROWS = 3;
const COLS = 4;
const NUM_WORKERS = navigator.hardwareConcurrency || 2;

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

/** Generates a simplex noise world. */
export class WorldGeneration extends HTMLElement {
  declare canvas: HTMLCanvasElement;
  declare context: CanvasRenderingContext2D;
  declare height: number;
  declare width: number;
  declare options: WorldGenerationOptions;
  declare workerPool: WorkerPool;
  declare rectangles: Rectangle[];

  /** Adds a canvas with a procedurally generated world. */
  constructor(options: Partial<WorldGenerationOptions> = {}) {
    super();

    this.options = { ...defaultOptions, ...options };

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

    this.rectangles = [
      ...Rectangle.tessellate([ROWS, COLS], [this.width, this.height]),
    ];
    this.workerPool = new WorkerPool(NUM_WORKERS, "worldGenerationWorker.js");

    this.render();
  }

  /** Generates image data for the canvas. */
  render() {
    const seeds = Array.from({ length: 255 }, () => Math.random());
    const promises = this.rectangles.map((rectangle) =>
      this.workerPool.addWork({
        rectangle,
        theme: this.options.theme,
        shape: this.options.shape,
        simplex: this.options.simplex,
        window: [this.width, this.height],
        seeds,
      })
    );

    Promise.all(promises)
      .then((responses) => {
        for (const { imageData, rectangle: { x0, y0 } } of responses) {
          this.context.putImageData(imageData, x0, y0);
        }
      })
      .catch((reason) => {
        console.error(reason);
      });
  }
}

customElements.define("world-generation", WorldGeneration);
