/**
 * @function fadeIn
 * @summary Fade in effect on a node. Change the color alpha channel.
 */
let fadeIn = (el, speed = 0.1) => {
  /**
   * Get node. Either model or quad.
   */
  let node = (el._model ? el._model : el._quad);

  /**
   * Check node exists.
   */
  if (!node) return;

  let op = 0;
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
   * When no alpha channel and HEX color, make it transparent by adding 00 alpha.
   * API will convert HEX color to RGBA.
   * This is a work-around for Quads since color is returned in HEX. Fix in 96. #BROW-3576
   */
  if (node.color.charAt(0) == '#' && node.color.length === 7)  {
    node.color = node.color + `00`;
  }

  /**
   * RGB color.
   * Add alpha 0-1 to RGBA color code.
   */
  if (node.color.charAt(0) !== '#' )  {
    /**
     * Get current color.
     */
    let colors = node.color.match(/[+-]?\d+(\.\d+)?/g);

    /**
     * Get current alpha channel.
     */
    if (parseFloat(colors[3]) > 0) {
      alphaChannel = parseFloat(colors[3]);
    }

    /**
     * Make it transparent by setting alpha to 0.
     */
    colors[3] = 0;
    node.color = `rgba(${colors.join(", ")})`;

    /**
     * Make the volume visible, in case it was hidden.
     */
    el.visibility = 'visible';

    (function fade() {
      op += speed;

      if (!(parseFloat(op) > alphaChannel)) {
        colors[3] = op;
        node.color = `rgba(${colors.join(", ")})`;

        /*
         * Using timeout. RAF stops when browser window is not active.
         */
        setTimeout(fade, 16);
      }
      else {
        /**
         * Set aplha channel to original.
         */
        colors[3] = alphaChannel;
        node.color = `rgba(${colors.join(", ")})`;

        /**
         * Make model opaque.
         * Set isOpaque.
         */
        if (typeof node.isOpaque !== 'undefined' && alphaChannel >= 1) {
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

export { fadeIn }
