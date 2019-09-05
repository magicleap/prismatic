/**
 * @module utilities/getOffsetCoordinates
 */
import { getXCoordinate, getYCoordinate, getZCoordinate } from './getCoordinates.js';

/**
 * Calculate coordinates using offset values from offset parameter in moveTo attribute.
 * Returns postion coordinates.
 * @param {HTMLElement} el HTML custom element.
 * @param {string[]} Offset values in array.
 * @returns {number[]} XYZ Coordinates.
 */
let getOffsetCoordinates = (el, offsetArr) => {
  /**
   * Get offset values for each axis.
   * If offset value is not available, return undefined.
   */
  let offsetPositionArr = getOffsetValues(offsetArr);

  /**
   * If offset value is numeric, calculate distance from center of volume (0,0,0).
   * If offset value is undefined, use current location.
   */
  let x = (!isNaN(parseFloat(offsetPositionArr[0]))) ? getXCoordinate(offsetPositionArr[0]) + (window.mlWorld.stageExtension.left - window.mlWorld.stageExtension.right)/2 : el._mainTransform.getLocalPosition()[0];
  let y = (!isNaN(parseFloat(offsetPositionArr[1]))) ? getYCoordinate(offsetPositionArr[1]) + (window.mlWorld.stageExtension.bottom - window.mlWorld.stageExtension.top)/2 : el._mainTransform.getLocalPosition()[1];
  let z = (!isNaN(parseFloat(offsetPositionArr[2]))) ? getZCoordinate(offsetPositionArr[2]) + (window.mlWorld.stageExtension.back - window.mlWorld.stageExtension.front)/2 : el._mainTransform.getLocalPosition()[2];

  return [x, y, z];
};

/***
 * Get offset values.
 * Return undefined if offset value is not available.
 */
let getOffsetValues = (offsetArr) => {
  let leftOffsetValue, topOffsetValue, zOffsetValue;

  /**
   * X-axis offset.
   */
  switch(offsetArr[0]) {
    case 'left':
      leftOffsetValue = 0;
      break;
    case 'middle':
    case 'center':
      leftOffsetValue = window.outerWidth / 2;
      break;
    case 'right':
      leftOffsetValue = window.outerWidth;
      break;
    default:
      leftOffsetValue = !isNaN(parseFloat(offsetArr[0])) ? parseFloat(offsetArr[0]) : undefined;
  }

  /**
   * Y-axis offset.
   */
  switch(offsetArr[1]) {
    case 'top':
      topOffsetValue = 0;
      break;
    case 'middle':
    case 'center':
      topOffsetValue = window.outerHeight / 2;
      break;
    case 'bottom':
      topOffsetValue = window.outerHeight;
      break;
    default:
      topOffsetValue = !isNaN(parseFloat(offsetArr[1])) ? parseFloat(offsetArr[1]) : undefined;
  }

  /**
   * Z-axis offset.
   */
  zOffsetValue = !isNaN(parseFloat(offsetArr[2])) ? parseFloat(offsetArr[2]) : undefined;

  return [leftOffsetValue, topOffsetValue, zOffsetValue]
}

export { getOffsetCoordinates, getOffsetValues }
