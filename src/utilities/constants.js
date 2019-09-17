/**
 * @constant
 * @summary Library Constants.
 */

/** @description Default z-offset distance in pixels.  */
export const DEFULT_Z_OFFSET = 150;

/** De facto standard: 1 pixel = 0.0264583 cm (1in = 96px = 2.54cm) */
export const PIXEL_TO_CM = 0.026458333;

/** Ratio used for hover mouseover effect to increase the size of the node on mouse over an extractable node.  */
export const MOUSE_OVER_RATIO = 1.25;

/** Z value used for hover mouseover effect to move the node forward in the z axis on mouse over an extractable node.  */
export const MOUSE_OVER_Z_MOVE = 0.02;

/** Record PIXEL TO METER. window.mlWorld.viewportWidth = window.innerWidth  */
export const PIXEL_TO_METER = (window.mlWorld ? window.mlWorld.viewportWidth / window.innerWidth : 0);
