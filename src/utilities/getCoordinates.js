import { pixelsToMetersSize } from '../utilities/pixelsToMetersSize.js';

/**
 * Calculate coordinates using DOM element's X and Y coordinates.
 * Returns postion coordinates.
 * @param {HTMLElement} el HTML custom element.
 * @returns {number[]} XYZ Coordinates.
 */
let getCoordinates = (el) => {
  let position = el.getBoundingClientRect();

  /**
   * Distance from left to center of element.
   */
  let positionX = getXCoordinate(position.left + (el.clientWidth/2)) + (window.mlWorld.stageExtent.left - window.mlWorld.stageExtent.right)/2;

  /**
   * Distance from top to center of element.
   */
  let positionY = getYCoordinate(position.top + (el.clientHeight/2)) + (window.mlWorld.stageExtent.bottom - window.mlWorld.stageExtent.top)/2;

  /**
   * Distance of element on Z axes (forward or backward).
   */
  let positionZ = getZCoordinate(el.zOffset) + (window.mlWorld.stageExtent.back - window.mlWorld.stageExtent.front)/2;

  return {
    positionX,
    positionY,
    positionZ
  }
}

let getXCoordinate = (value) => {
  let x = pixelsToMetersSize(value) - (window.mlWorld.viewportWidth / 2) ;
  return Math.fround(x);
}

let getYCoordinate = (value) => {
  let y = (window.mlWorld.viewportHeight / 2) - pixelsToMetersSize(value);
  return Math.fround(y);
}

let getZCoordinate = (value) => {
  let z = pixelsToMetersSize(value);
  return Math.fround(z);
}

export { getCoordinates, getXCoordinate, getYCoordinate, getZCoordinate }
