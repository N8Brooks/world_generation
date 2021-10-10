/** Red, green, blue. */
export type RgbColor = [number, number, number];

/** Type for color configs. */
export type ColorBand = {
  upperBound: number;
  rgbColor: RgbColor;
};

/** Represents the color theme of the generated world. */
export class Theme {
  declare colorBands: ColorBand[];

  /** Takes an array of color bands used to develop `heightToColor`. */
  constructor(...colorBands: ColorBand[]) {
    this.colorBands = colorBands;
  }

  /** Array mapping integers to their corresponding color. */
  get heightToColor(): number[] {
    this.colorBands.sort((a, b) => a.upperBound - b.upperBound);
    const heightToColor: number[] = Array(this.length);
    let lowerBound = 0;
    for (const { upperBound, rgbColor } of this.colorBands) {
      const color = Theme.rgbToColor(rgbColor);
      heightToColor.fill(color, lowerBound, upperBound + 1);
      lowerBound = upperBound;
    }
    return heightToColor;
  }

  /** Length of `heightToColor`. */
  get length(): number {
    return Math.max(-1, ...this.colorBands.map((band) => band.upperBound)) + 1;
  }

  /** Maps 8-bit rgb values to a 32-bit integer. */
  static rgbToColor([r, g, b]: RgbColor): number {
    return r + (g << 8) + (b << 16) + (255 << 24);
  }
}

/** Default coloring themes. */
export const Themes = {
  /** Plain colors that look like a map. */
  atlas: new Theme(
    { upperBound: 40, rgbColor: [138, 180, 248] }, // water
    { upperBound: 48, rgbColor: [187, 226, 198] }, // light grass
    { upperBound: 50, rgbColor: [168, 218, 181] }, // dark grass
    { upperBound: 58, rgbColor: [251, 248, 243] }, // light sand
    { upperBound: 61, rgbColor: [245, 240, 228] }, // dark sand
    { upperBound: 64, rgbColor: [148, 210, 165] }, // light trees
    { upperBound: 66, rgbColor: [136, 193, 152] }, // dark trees
    { upperBound: 75, rgbColor: [178, 207, 189] }, // light rock
    { upperBound: 78, rgbColor: [164, 191, 174] }, // dark rock
    { upperBound: 80, rgbColor: [233, 233, 233] }, // dark snow
    { upperBound: 100, rgbColor: [255, 255, 255] }, // light snow
  ),

  /** Vibrant colors that look like a video game. */
  pixel: new Theme(
    { upperBound: 26, rgbColor: [1, 49, 99] }, // water 6
    { upperBound: 30, rgbColor: [0, 62, 125] }, // water 5
    { upperBound: 34, rgbColor: [0, 70, 139] }, // water 4
    { upperBound: 38, rgbColor: [1, 84, 168] }, // water 3
    { upperBound: 42, rgbColor: [0, 94, 189] }, // water 2
    { upperBound: 45, rgbColor: [0, 106, 212] }, // water 1
    { upperBound: 50, rgbColor: [1, 118, 237] }, // water 0
    { upperBound: 53, rgbColor: [237, 195, 154] }, // sand
    { upperBound: 56, rgbColor: [43, 144, 0] }, // grass
    { upperBound: 58, rgbColor: [36, 128, 47] }, // light trees
    { upperBound: 64, rgbColor: [22, 89, 32] }, // dark trees
    { upperBound: 70, rgbColor: [122, 122, 122] }, // dark rock
    { upperBound: 75, rgbColor: [143, 143, 143] }, // light rock
    { upperBound: 80, rgbColor: [204, 204, 204] }, // dark snow
    { upperBound: 100, rgbColor: [255, 255, 255] }, // light snow
  ),
};
