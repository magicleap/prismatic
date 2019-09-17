import { PIXEL_TO_METER } from '../utilities/constants.js';

/**
 * Convert from pixels to meters.
 * Returns value in meters.
 * @param {number} pixelValue Pixel value to be converted to meter.
 * @returns {number} Value in meters.
 */
let pixelsToMetersSize = (pixelValue) => {
  return Math.fround(pixelValue * PIXEL_TO_METER);
}

export { pixelsToMetersSize }
