import { setSkipRaycast } from '../helpers/setSkipRaycast.js';
import { setScale as setModelScale } from '../helpers/setScale.js';
import { setRotation as setModelRotation } from '../helpers/setRotation.js';
import { setModelAnimation, setModelAnimationSpeed } from '../helpers/setModelAnimation.js';
import { setSpin as setModelSpin } from '../helpers/setSpin.js';
import { setScaleTo as setModelScaleTo } from '../helpers/setScaleTo.js';
import { setScaleBy as setModelScaleBy } from '../helpers/setScaleBy.js';
import { setMoveTo as setModelMoveTo } from '../helpers/setMoveTo.js';
import { setMoveBy as setModelMoveBy } from '../helpers/setMoveBy.js';
import { setRotateToAngles as setModelRotateToAngles } from '../helpers/setRotateToAngles.js';
import { setRotateByAngles as setModelRotateByAngles } from '../helpers/setRotateByAngles.js';
import { setNodeExtraction, unsetNodeExtraction } from '../helpers/setNodeExtraction.js';
import { setHoverState, unsetHoverState } from '../helpers/setHoverState.js';
import { setNodeSize as setModelSize} from '../helpers/setNodeSize.js';
import { setNodePosition as setModelPosition } from '../helpers/setNodePosition.js';
import { parseEnvironmentLighting } from '../utilities/parseEnvironmentLighting.js';
import { resetOriginalSizePosition } from '../utilities/resetOriginalSizePosition.js';
import { isElementVisible } from '../utilities/isElementVisible.js';

/**
 * Set attributes: extractable, color, environment lighting, skipRaycast, visibility, model scale,
 * rotation, animation, spin, scaleTo, scaleBy, moveTo, moveBy, rotateToAngles, rotateByAngles, breadth, z-offset.
 * @param {HTMLElement} el HTML custom element.
 * @param {JSONObject} elemAttributes Attribute name and value to be set.
 */
let setModelAttributes = (el, elemAttributes) => {
  /**
   * Get the volume.
   */
  let volume = window.mlWorld[0];

  /**
   * Get the model.
   */
  let model = el._model;

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
   * Set model-specific attributes.
   */
  if (model) {
    /**
     * Set model color.
     */
    if (elemAttributes.color) {
      model.color = elemAttributes.color;
    }
    /**
     * Color value is blank. Reset model color.
     */
    else if (elemAttributes.color === '') {
      model.color = "#FFFFFF";
    }

    /**
     * Check for environment lighting and apply attributes if available.
     */
    if (elemAttributes['environment-lighting']) {
      let environmentLighting = parseEnvironmentLighting(elemAttributes['environment-lighting']);

      if (environmentLighting['color-intensity']) {
        model.colorIntensity = environmentLighting['color-intensity'];
      }

      if (environmentLighting['bloom-strength']) {
        model.bloomStrength = environmentLighting['bloom-strength'];
        volume.bloomStrength = environmentLighting['bloom-strength'];
      }
    }

    /**
     * Set skipRaycast.
     */
    if (elemAttributes.raycast) {
      setSkipRaycast(model, !(elemAttributes.raycast === 'true'));
    }

    /**
     * Set node visibility.
     */
    if (elemAttributes.visibility) {
      model.visible = isElementVisible(el) && !(elemAttributes.visibility === 'hidden');
    }

    /**
     * Set model scale.
     */
    if (elemAttributes['model-scale']) {
      setModelScale(el, elemAttributes['model-scale']);

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set model scale.
     */
    if (elemAttributes['scale']) {
      setModelScale(el, elemAttributes['scale']);

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set model rotation.
     */
    if (elemAttributes.rotation) {
      setModelRotation(el, elemAttributes.rotation);
    }

    /**
     * Set model animation.
     */
    if (elemAttributes['model-animation']) {
      setModelAnimation(el, elemAttributes['model-animation'], el.animationSpeed);
    }

    /**
     * Set model animation speed.
     */
    if (elemAttributes['model-animation-speed']) {
      setModelAnimationSpeed(el, elemAttributes['model-animation-speed']);
    }

    /**
     * Set model spin.
     */
    if (elemAttributes.spin) {
      setModelSpin(el, elemAttributes.spin);
    }

    /**
     * Set model scale to.
     */
    if (elemAttributes['scale-to']) {
      setModelScaleTo(el, elemAttributes['scale-to']);

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set model scale by.
     */
    if (elemAttributes['scale-by']) {
      setModelScaleBy(el, elemAttributes['scale-by']);

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set model move to.
     */
    if (elemAttributes['move-to']) {
      setModelMoveTo(el, elemAttributes['move-to']);
    }

    /**
     * Set model move by.
     */
    if (elemAttributes['move-by']) {
      setModelMoveBy(el, elemAttributes['move-by']);

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }

    /**
     * Set model rotate to.
     */
    if (elemAttributes['rotate-to-angles']) {
      setModelRotateToAngles(el, elemAttributes['rotate-to-angles']);
    }

    /**
     * Set model rotate by.
     */
    if (elemAttributes['rotate-by-angles']) {
      setModelRotateByAngles(el, elemAttributes['rotate-by-angles']);
    }

    /**
     * New breadth or z-offset attribute value.
     * Set node size and position.
     */
    if (elemAttributes['breadth'] || elemAttributes['z-offset']) {
      setModelSize(el);
      setModelPosition(el);
    }
  }
};

export { setModelAttributes }
