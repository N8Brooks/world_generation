import { Dimensions } from "./Tile.ts";

export type Shape = (x: number, y: number) => number;

let centerX = NaN;
let centerY = NaN;
let maximumDistance = NaN;

/** Used to generate land shape of generated world. */
export const Shapes = {
  square,
  circle,
  flat,
};

export function setDimensions([width, height]: Dimensions) {
  centerX = Math.floor(width / 2);
  centerY = Math.floor(height / 2);
  maximumDistance = Math.min(centerX, centerY);
}

/** Returns a number where `0 <= x <= 1` where lower values make a pyramid in the middle. */
function square(x: number, y: number): number {
  const distanceX = Math.abs(x - centerX);
  const distanceY = Math.abs(y - centerY);
  const minimumDistance = Math.max(distanceX, distanceY);
  return Math.min(1, minimumDistance / maximumDistance);
}

/** Returns a number where `0 <= x <= 1` where lower values make a cone in the middle. */
function circle(x: number, y: number): number {
  const distanceX = x - centerX;
  const distanceY = y - centerY;
  const distance = Math.hypot(distanceX, distanceY);
  return Math.min(1, distance / maximumDistance);
}

/** Returns a constant which will not form an island. */
function flat(_x: number, _y: number): number {
  return 0.5;
}
