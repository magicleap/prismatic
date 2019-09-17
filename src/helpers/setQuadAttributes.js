import { setSkipRaycast } from '../helpers/setSkipRaycast.js';
import { setScale as setQuadScale } from '../helpers/setScale.js';
import { setRotation as setQuadRotation } from '../helpers/setRotation.js';
import { setSpin as setQuadSpin } from '../helpers/setSpin.js';
import { setScaleTo as setQuadScaleTo } from '../helpers/setScaleTo.js';
import { setMoveTo as setQuadMoveTo } from '../helpers/setMoveTo.js';
import { setMoveBy as setQuadMoveBy } from '../helpers/setMoveBy.js';
import { setRotateToAngles as setQuadRotateToAngles } from '../helpers/setRotateToAngles.js';
import { setRotateByAngles as setQuadRotateByAngles } from '../helpers/setRotateByAngles.js';
import { setNodeExtraction, unsetNodeExtraction } from '../helpers/setNodeExtraction.js';
import { setHoverState, unsetHoverState } from '../helpers/setHoverState.js';
import { setNodeSize as setQuadSize } from '../helpers/setNodeSize.js';
import { setNodePosition as setQuadPosition } from '../helpers/setNodePosition.js';
import { parseEnvironmentLighting } from '../utilities/parseEnvironmentLighting.js';
import { resetOriginalSizePosition } from '../utilities/resetOriginalSizePosition.js';
import { isElementVisible } from '../utilities/isElementVisible.js';

/**
 * Set attributes: extractable, color, environment lighting, raycast, visibility, scale,
 * rotation, spin, scaleTo, moveTo, moveBy, rotateToAngles, rotateByAngles, breadth, z-offset.
 * @param {HTMLElement} el HTML custom element.
 * @param {JSONObject} elemAttributes Attribute name and value to be set.
 */
let setQuadAttributes = (el, elemAttributes) => {
  /**
   * Get the volume.
   */
  let volume = mlWorld[0];

  /**
   * Get the quad.
   */
  let quad = el._quad;

  /**
   * Set/Unset extraction.
   */
  if (elemAttributes.extractable) {
    if (elemAttributes.extractable !== 'false') {
      setHoverState(el);
      setNodeExtraction(el);
    } else {
      unsetHoverState(el);
      unsetNodeExtraction(el);
    }
  }

  /**
   * Set quad-specific attributes.
   */
  if (quad) {
    /**
     * Set quad color.
     */
    if (elemAttributes.color) {
      quad.color = elemAttributes.color;
    }
    /**
     * Color value is blank. Reset quad color.
     */
    else if (elemAttributes.color === '') {
      let isPNG = new RegExp(/(\.png(\?|#|$))|^(data:image\/png;base64,*)/i);
      if (isPNG.test(el.src)) {
        quad.color = "rgba(255, 255, 255, 0.99)";
      }
      else {
        quad.color = "#FFFFFF";
      }
    }

    /**
     * Check for environment lighting and apply attributes if available.
     */
    if (elemAttributes['environment-lighting']) {
      let environmentLighting = parseEnvironmentLighting(elemAttributes['environment-lighting']);

      if (environmentLighting['color-intensity']) {
        quad.colorIntensity = environmentLighting['color-intensity'];
      }

      if (environmentLighting['bloom-strength']) {
        quad.bloomStrength = environmentLighting['bloom-strength'];
        volume.bloomStrength = environmentLighting['bloom-strength'];
      }
    }

    /**
     * Set skipRaycast.
     */
    if (elemAttributes.raycast) {
      setSkipRaycast(quad, !(elemAttributes.raycast == 'true'));
    }

    /**
     * Set node visibility.
     */
    if (elemAttributes.visibility) {
      quad.visible = isElementVisible(el) && !(elemAttributes.visibility === 'hidden');
    }

    /**
     * Set quad scale.
     */
    if (elemAttributes['quad-scale']) {
      setQuadScale(el, elemAttributes['quad-scale']);

      /* Reset properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set quad rotation.
     */
    if (elemAttributes.rotation) {
      setQuadRotation(el, elemAttributes.rotation);
    }

    /**
     * Set quad spin.
     */
    if (elemAttributes.spin) {
      setQuadSpin(el, elemAttributes.spin);
    }

    /**
     * Set quad scale to.
     */
    if (elemAttributes['scale-to']) {
      setQuadScaleTo(el, elemAttributes['scale-to']);

      /* Reset properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set quad move to.
     */
    if (elemAttributes['move-to']) {
      setQuadMoveTo(el, elemAttributes['move-to']);

      /* Reset properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set quad move by.
     */
    if (elemAttributes['move-by']) {
      setQuadMoveBy(el, elemAttributes['move-by']);

      /* Reset properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set quad rotate to.
     */
    if (elemAttributes['rotate-to-angles']) {
      setQuadRotateToAngles(el, elemAttributes['rotate-to-angles']);
    }

    /**
     * Set quad rotate by.
     */
    if (elemAttributes['rotate-by-angles']) {
      setQuadRotateByAngles(el, elemAttributes['rotate-by-angles']);
    }

    /**
     * New breadth or z-offset attribute value.
     * Set volume and quad size and position.
     */
    if (elemAttributes['breadth'] || elemAttributes['z-offset']) {
      setQuadSize(el);
      setQuadPosition(el);
    }
  }
};

export { setQuadAttributes }
