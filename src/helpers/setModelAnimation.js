import { parseModelAnimation } from '../utilities/parseModelAnimation.js';

/**
 * The model-animation attribute value is parsed, validated and added to model.playAnimation().
 * If animationSpeed is specified, set the model animation playback speed.
 * @param {HTMLElement} el HTML custom element.
 * @param {string} animation Animation name to be play.
 * @param {number} animationSpeed Animation speed.
 */
let setModelAnimation = (el, animation, animationSpeed) => {
  /**
   * Model Animation.
   */
  if (animation) {
    /**
     * Parse animation attribute into animation name, pause state and iterations.
     */
    let parsedAnimation = parseModelAnimation(animation);

    if (parsedAnimation && el._model) {
      /**
       * Name, paused and iterations.
       */
      el._model.playAnimation(parsedAnimation.name, parsedAnimation.paused, parsedAnimation.iterations);

      /**
       * Set animationPlaybackSpeed, if specified.
       */
      if (!isNaN(parseInt(animationSpeed))) {
        el._model.animationPlaybackSpeed = Number(animationSpeed);
      }
    }
  }
};

/**
 * Set Model Animation Speed.
 * @param {HTMLElement} el HTML custom element.
 * @param {number} animationSpeed Animation speed.
 */
let setModelAnimationSpeed = (el, animationSpeed) => {
  if (!isNaN(parseInt(animationSpeed)) && el._model) {
    el._model.animationPlaybackSpeed = Number(animationSpeed);
  }
};

export { setModelAnimation, setModelAnimationSpeed }
