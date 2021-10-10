import { Dimensions } from "./Rectangle.ts";

/** Shape function signature. */
export type Shape = (x: number, y: number) => number;

/** Used to generate land shape of generated world. */
export const Shapes = {
  square,
  circle,
  flat,
};

/** Holds a shape function. */
interface ShapeHolder {
  /** Horizontal center. */
  centerX: number;

  /** Vertical center. */
  centerY: number;

  /** Minimum distance to edge from center */
  maximumDistance: number;
}

/** Returns a number where `0 <= x <= 1` where lower values make a pyramid in the middle. */
function square(this: ShapeHolder, x: number, y: number): number {
  const distanceX = Math.abs(x - this.centerX);
  const distanceY = Math.abs(y - this.centerY);
  const minimumDistance = Math.max(distanceX, distanceY);
  return Math.min(1, minimumDistance / this.maximumDistance);
}

/** Returns a number where `0 <= x <= 1` where lower values make a cone in the middle. */
function circle(this: ShapeHolder, x: number, y: number): number {
  const distanceX = x - this.centerX;
  const distanceY = y - this.centerY;
  const distance = Math.hypot(distanceX, distanceY);
  return Math.min(1, distance / this.maximumDistance);
}

/** Returns a constant which will not form an island. */
function flat(this: ShapeHolder, _x: number, _y: number): number {
  return 0.5;
}
