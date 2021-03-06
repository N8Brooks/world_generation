/** X and y coordinate on two-dimensional plane. */
export type Point = [number, number];

/** Width and height measurements. */
export type Dimensions = [number, number];

/** Represents a rectangle starting at `coordinate` that is the size of `dimensions`. */
export class Tile {
  declare x0: number;
  declare y0: number;
  declare width: number;
  declare height: number;

  constructor([x0, y0]: Point, [width, height]: Dimensions) {
    this.x0 = x0;
    this.y0 = y0;
    this.width = width;
    this.height = height;
  }

  /** Divides a `width` by `height` tile into `rows * cols` tiles. */
  static *tessellate([rows, cols]: Dimensions, [width, height]: Dimensions) {
    const columnWidth = Math.ceil(width / cols);
    const rowHeight = Math.ceil(height / rows);
    for (let row = 0; row < rows; row++) {
      const tileHeight = row < rows - 1
        ? rowHeight
        : height - rowHeight * (rows - 1);

      for (let col = 0; col < cols; col++) {
        const tileWidth = col < cols - 1
          ? columnWidth
          : width - columnWidth * (cols - 1);

        yield new Tile(
          [col * columnWidth, row * rowHeight],
          [tileWidth, tileHeight],
        );
      }
    }
  }
}
