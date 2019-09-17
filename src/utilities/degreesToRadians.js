/**
 * Convert angle from degrees to radians.
 * Returns the angle in radians.
 * @param {float} angle Angle in degrees to be converted to radians.
 * @returns {float} Angle in radians.
 */
let degreesToRadians = (angle) => {
  return angle * (Math.PI / 180);
};

export { degreesToRadians }
