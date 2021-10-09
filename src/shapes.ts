/** Vertical center of screen. */
const centerY = Math.floor(window.innerHeight / 2);

/** Horizontal center of screen. */
const centerX = Math.floor(window.innerWidth / 2);

/** Minimum distance to wall from center. */
const distanceToWall = Math.min(centerX, centerY);

/** Returns a number where `0 <= x <= 1` where lower values make a pyramid in the middle. */
function square(x: number, y: number): number {
  const distanceX = Math.abs(x - centerX);
  const distanceY = Math.abs(y - centerY);
  const minimumDistance = Math.max(distanceX, distanceY);
  return Math.min(1, minimumDistance / distanceToWall);
}

/** Returns a number where `0 <= x <= 1` where lower values make a cone in the middle. */
function circle(x: number, y: number): number {
  const distanceX = x - centerX;
  const distanceY = y - centerY;
  const distance = Math.hypot(distanceX, distanceY);
  return Math.min(1, distance / distanceToWall);
}

/** Returns a constant. */
function none(_x: number, _y: number): number {
  return 0.5;
}

export const shapes = {
  circle,
  square,
  none,
};
