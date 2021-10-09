import { makeWorldGenerator } from "./makeWorldGenerator.ts";
import { WorldGenerationOptions } from "./WorldGenerationOptions.ts";

const defaultOptions: WorldGenerationOptions = {
  style: "pixel",
  shape: "circle",
  frequency: 0.002,
  octaves: 5,
  persistance: 0.5,
};

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
    const worldGenerator = makeWorldGenerator(this.options);
    const imageData = new ImageData(this.width, this.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        buffer[this.width * y + x] = worldGenerator(x, y);
      }
    }
    this.context.putImageData(imageData, 0, 0);
  }
}

customElements.define("world-generation", WorldGeneration);
