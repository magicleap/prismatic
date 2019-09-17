/**
 * @module utilities/parseRotation
 */
import { degreesToRadians } from '../utilities/degreesToRadians.js';

/**
 * Parse and validate rotation attribute values.
 * Returns array with rotation in radians.
 * @param {string} rotation Rotation attribute value.
   @returns {number[]} Array with rotation in radians.
 */
let parseRotation = (rotation) => {
  /**
   * Replace all non-alphanumeric with a space. Create array and cast to float.
   */
  let rotationArr = rotation.trim().replace(/[^\d.-]+/g, ' ').split(' ').map(parseFloat).filter((val) => !isNaN(val));

  /**
   * Check if rotation values are in degrees by checking for string 'deg'.
   * Convert to radians.
   */
  if ((rotation.toLowerCase().split('deg').length - 1) > 0) {
    rotationArr = rotationArr.map((val) => degreesToRadians(val));
  }

  /**
   * Validate rotation array length.
   */
  if (rotationArr && rotationArr.length === 3) {
    return rotationArr;
  }
  else {
    console.error('Invalid values used for rotation attribute.');
  }
};

export { parseRotation }
