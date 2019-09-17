/**
 * @module utilities/getAttributeInPixel
 */

import { PIXEL_TO_CM } from '../utilities/constants.js';

/**
 * Return attribute value in pixel.
 * Check for unit name in cm or mm and convert to pixel.
 * Returns value in pixels.
 * @param {string} attributeValue Value to be converted to pixels.
 * @returns {number} Value in pixels
 */
let getAttributeInPixel = (attributeValue) => {
  let attributeValueInPixel = 0;

  /**
   * Check for unit name in the value and convert to px.
   * If no unit, assume value is in pixel.
   */
  if (parseFloat(attributeValue)) {
    let unitName = attributeValue.toString().replace(/[^A-Za-z]/g, "").toLowerCase();

    if (unitName === 'cm') {
      attributeValueInPixel = parseFloat(attributeValue) / PIXEL_TO_CM ;
    }
    else if (unitName === 'mm') {
      attributeValueInPixel = parseFloat(attributeValue) / PIXEL_TO_CM / 10; //mm
    }
    else {
      attributeValueInPixel = parseFloat(attributeValue);
    }
  }

  return attributeValueInPixel;
}

export { getAttributeInPixel }
