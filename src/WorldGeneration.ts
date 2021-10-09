import { ensemble } from "./heightGeneration.ts";

export class WorldGeneration extends HTMLElement {
  declare canvas: HTMLCanvasElement;
  declare context: CanvasRenderingContext2D;
  declare height: number;
  declare width: number;
  declare imageData: ImageData;

  /** Adds a canvas with a procedurally generated world. */
  constructor() {
    super();
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
    this.generate();
  }

  /** Generates image data for the canvas. */
  generate() {
    const imageData = new ImageData(this.width, this.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        buffer[this.width * y + x] = ensemble(x, y);
      }
    }
    this.context.putImageData(imageData, 0, 0);
  }
}

customElements.define("world-generation", WorldGeneration);
