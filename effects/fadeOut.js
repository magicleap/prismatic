/**
 * @module effects/fadeOut
 */

/**
 * @function fadeOut
 * @summary Fade out effect on a node. Change the color alpha channel.
 */
let fadeOut = (el, speed = 0.1) => {
  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * Check node exists.
   */
  if (!node) return;

  let op = 1;
  let alphaChannel = 1;

  /**
   * Read current node's backfaceVisibility.
   */
  let currentBackfaceVisibility = node.backfaceVisibility;

  /**
   * Turn off backfaceVisibility to improve fade in.
   */
  node.backfaceVisibility = false;

  /**
   * When no alpha channel and HEX color, make it semi opaque by adding FE alpha.
   * API will convert HEX color to RGBA.
   * This is a work-around for Quads since color is returned in HEX. Fix in 96. #BROW-3576
   */
  if (node.color.charAt(0) == '#' && node.color.length === 7)  {
    node.color = node.color + `FE`;
  }

  /**
   * RGB color.
   * Add alpha 1-0 to RGBA color code.
   */
  if (el._volume.visible && node.color.charAt(0) !== '#')  {
    /**
     * Get current color.
     */
    let colors = node.color.match(/[+-]?\d+(\.\d+)?/g);

    /**
     * Get current alpha channel.
     * Set op = alphaChannel to start fadeout at the current alpha channel.
     */
    if (parseFloat(colors[3]) > 0) {
      alphaChannel = parseFloat(colors[3]);
      op = alphaChannel;
    }

    (function fade() {
      op -= speed;

      if (!(parseFloat(op) < 0)) {
        colors[3] = op;
        node.color = `rgba(${colors.join(", ")})`;

        /*
         * Using timeout. RAF stops when browser window is not active.
         */
        setTimeout(fade, 16);
      }
      else {
        /**
         * Make volume invisible and set color back to original.
         */
        el.visibility = 'hidden';

        colors[3] = alphaChannel;
        node.color = `rgba(${colors.join(", ")})`;

        /**
         * Make model opaque.
         * Set isOpaque.
         */
        if (typeof node.isOpaque !== 'undefined') {
          node.isOpaque = true;
        }

        /**
         * Set backfaceVisibility to original.
         */
        node.backfaceVisibility = currentBackfaceVisibility;
      }
    })();
  }
};

export { fadeOut }
