/** Function signature returned by shape factories. */
export type Shape = (x: number, y: number) => number;

/** Holds factories to make shapes of land masses. */
export const Shapes = {
  /** Returns a function that generates higher number based on their closeness to a wall. */
  square(centerX: number, centerY: number): Shape {
    const maximumDistance = Math.min(centerX, centerY);
    return function (x: number, y: number): number {
      const distanceX = Math.abs(x - centerX);
      const distanceY = Math.abs(y - centerY);
      const minimumDistance = Math.max(distanceX, distanceY);
      return Math.min(1, minimumDistance / maximumDistance);
    };
  },

  /** Returns a function that generates higher numbers based on their distance from center. */
  circle(centerX: number, centerY: number): Shape {
    const maximumDistance = Math.min(centerX, centerY);
    return function (x: number, y: number): number {
      const distanceX = x - centerX;
      const distanceY = y - centerY;
      const distance = Math.hypot(distanceX, distanceY);
      return Math.min(1, distance / maximumDistance);
    };
  },

  /** Returns a function that generates a constant which will not form an island. */
  flat(_centerX: number, _centerY: number): Shape {
    return function (_x: number, _y: number): number {
      return 0.5;
    };
  },
};
