/**
 * @module utilities/parseAnimation
 */
import { degreesToRadians } from '../utilities/degreesToRadians.js';

/**
 * Parse and validate animation attribute values.
 * Use default values for duration, track, rate if not specified in attribute.
 * Returns JSON Object with the animation properties.
 * @param {string} attributeValue Animation attribute value.
 * @param {boolean} spinBol True when animation is a spin animation.
 * @returns {JSONObject} Properties for animation.
 */
let parseAnimation = (attributeValue, spinBol = false) => {
  let animation = {};

  /**
   * Attribute values delimeted by semi-colon
   */
  let attributeValueArr = attributeValue.toLowerCase().split(/;/);

  attributeValueArr.forEach(attributeValue => {
    /**
     * Each attribute value has property name and value (name:value).
     */
    let attributeProp = attributeValue.split(':');

    /**
     * Expects name and value.
     */
    if (attributeProp.length === 2) {
      let attributePropName = attributeProp[0].trim();
      let attributePropValue = attributeProp[1].trim();

      /**
       * If offset property exists, don't convert axes values to float,
       * since they may not be numeric (left, center, top, etc)
       */
      if (attributePropName === 'offset') {
        /**
         * Replace commas, newline, tabs with space and remove duplicate spaces to create array.
         */
        animation[attributePropName] = attributePropValue.replace(/\r?\n|\r|\t|,/gm, ' ').replace(/  +/g, ' ').split(' ');
      }
      else {
        /**
         * Get numeric values and create array.
         */
        let animationValueArr = attributePropValue.match(/[+-]?\d+(\.\d+)?/g);
        if (animationValueArr) {
          animation[attributePropName] = animationValueArr.map((val) => parseFloat(val));
        }

        if (animation[attributePropName]) {
          /**
           * If only one value exists, assign just the value. This is for duration, track, rate.
           */
          if (animation[attributePropName].length === 1) {
            animation[attributePropName] = animation[attributePropName][0];

            /**
             * If spin animation and rate property, check if value is in degrees by checking for 'deg'.
             * Convert to radians.
             */
            if (spinBol && (attributePropName === 'angle' || attributePropName === 'rate')) {
              if (isNaN(attributePropValue) && !isNaN(parseFloat(attributePropValue)) && attributePropValue.indexOf('deg') !== -1) {
                animation[attributePropName] = degreesToRadians(parseFloat(attributePropValue));
              }
            }
          }
          /**
           * If angles, check if values are in degrees by checking for string 'deg'.
           * Convert to radians.
           */
          else if (attributePropName === 'angles') {
            /**
             * Check string 'deg' is present one time per valid axis.
             */
            let zeroCount = animation[attributePropName].reduce((n, val) => (n + (val === 0)), 0);
            if ((attributePropValue.split('deg').length - 1) >= (3-zeroCount)) {
              animation[attributePropName] = animation[attributePropName].map((val) => degreesToRadians(val));
            }
          }
        }
      }
    }
  });

  /**
   * Validate that axes contains three values, one for each axes.
   */
  if ((animation.axes && animation.axes.length === 3) || (animation.angles && animation.angles.length === 3) || (animation.offset && animation.offset.length === 3)) {
    /**
     * If no duration, use default value of 1.
     */
    if (isNaN(animation.duration)) {
      animation.duration = 60;
      console.warn(`No duration value in animation attribute. Default value of 60 seconds used.`);
    }

    /**
     * If no track, use default value of 0.
     */
    if (!Number.isInteger(animation.track)) {
      animation.track = 0;
      console.warn(`No track value in animation attribute. Default value of 0 used.`);
    }

    /**
     * When spin, if rate attribute name used, switch to angle and delete rate.
     */
    if (spinBol && animation.hasOwnProperty('rate') && !isNaN(parseFloat(animation.rate))) {
      animation.angle = animation.rate;
      delete animation.rate;
    }

    /**
     * If spin animation and no angle, use default value of 60deg.
     */
    if (spinBol && isNaN(animation.angle)) {
      animation.angle = 1.0472;
      console.warn(`No angle rate value in spin animation attribute. Default value of 60 degrees per second used.`);
    }

    return animation;
  }
  else {
    console.error(`Invalid axes value used for animation attribute.`);
  }
};

export { parseAnimation }
