import { DEFULT_Z_OFFSET } from '../utilities/constants.js';
import { getAttributeInPixel } from '../utilities/getAttributeInPixel.js';
import { isElementVisible } from '../utilities/isElementVisible.js';
import { isNodeInsideStage } from '../utilities/isNodeInsideStage.js';

import { createVolume } from '../helpers/createVolume.js';
import { doQuadRendering } from '../helpers/doQuadRendering.js';
import { doQuadInstance } from '../helpers/doQuadInstance.js';
import { setQuadAttributes } from '../helpers/setQuadAttributes.js';
import { setHoverState } from '../helpers/setHoverState.js';
import { setNodeExtraction } from '../helpers/setNodeExtraction.js';
import { setScrollable, unsetScrollable } from '../helpers/setScrollable.js';
import { setMutationObserver } from '../helpers/setMutationObserver.js';
import { setResizeObserver } from '../helpers/setResizeObserver.js';
import { setResizeListener, unsetResizeListener } from '../helpers/setResizeListener.js';
import { setStageChangeListener, unsetStageChangeListener } from '../helpers/setStageChangeListener.js';
import { deleteNode } from '../helpers/deleteNode.js'

/* Effects */
import { fadeOut } from '../effects/fadeOut.js';
import { fadeIn } from '../effects/fadeIn.js';
import { wiggle } from '../effects/wiggle.js';

/**
 * <ml-quad> HTML Custom Element.
 */
export class MlQuad extends HTMLElement {

  /**
   * An instance of custom element is instantiated.
   */
  constructor() {
    super();

    /**
     * Set fallback image when error rendering node.
     */
    this.addEventListener('error', function(e) {
      if (!this._quad && this.hasAttribute('alt-img')) {
        /* set fall back image */
        this.style.setProperty('background-image','url(' + this.getAttribute('alt-img') + ')');
        this.style.setProperty('background-repeat','no-repeat');
        this.style.setProperty('background-size','100%');
      }
    }, true);
  }

  /**
   * Called every time the element is inserted into the DOM.
   */
  connectedCallback() {
    /**
     * Dispatch error if no mlWorld
     */
    if (!window.mlWorld) {
      this.dispatchEvent(new ErrorEvent("error",{error: new Error('Unable to render 3D content on this device.'), message: "No mixed-reality browser detected.", bubbles: true}));
      return;
    }

    /**
     * When CSS display is not specified, set CSS display to inline-block.
     */
    if (!this.style.display) {
      this.style.display = 'inline-block';
    }

    /**
     * If node has extractable flag, set hover and extract.
     */
    if (this.extractable) {
      /**
       * Set hover mouseover effect.
       */
      setHoverState(this);

      /**
       * Set node extraction.
       */
      setNodeExtraction(this);
    }

    /**
     * Observe custom element for changes on CSS style: visibility, size and position.
     */
    setMutationObserver(this);

    /**
     * Observe custom element for changes in size.
     */
    setResizeObserver(this);

    /**
     * Listen when browser window is resized.
     * Re-position node.
     */
    setResizeListener(this);

    /**
     * Listen when stage size or position change.
     * Re-position node.
     */
    setStageChangeListener(this);

    /**
     * Models are scrollable by default.
     */
    setScrollable(this);
  } //end of connectedCallback

  /**
   * Render node.
   */
  render() {
    if (this.src && window.mlWorld) {
      /**
       * Check for Volume.
       * If no Volume, reset stage and create bounded volume.
       */
      if (mlWorld.length === 0) {
        /**
         * Reset stage.
         */
        window.mlWorld.resetStageExtent();

        /**
         * Create volume.
         */
        createVolume(this);
      }

      /* Render. */
      doQuadRendering(this).then(() => {
        /**
         * Quad visibility
         */
        this._quad.visible = isElementVisible(this) && !(this.visibility === 'hidden');

        /**
         * Check for instances.
         */
        if (this.id) {
          let instances = document.querySelectorAll(`ml-quad[instance=${this.id}]`);
          instances.forEach((quadInstance) => {

            /**
             * Render instance of node.
             */
            doQuadInstance(quadInstance, this);
            /**
             * Instance visibility.
             */
            if (quadInstance._quad) {
              quadInstance._quad.visible = isElementVisible(quadInstance) && !(quadInstance.getAttribute('visibility') === 'hidden');
            }
          });
        }
      }).catch((err) => {
        /* Dispatch error event. */
        this.dispatchEvent(new ErrorEvent("error",{error: err, message: err.message || "Problem rendering node", bubbles: true}));
        /* Show error. */
        console.error(`Problem rendering: ${err}`);
      });
    }
  }

  /**
   * A method of the HTML element.
   */
  isNodeInsideStage() {
    return isNodeInsideStage(this);
  }

  /**
   * Set names of attributes to observe.
   */
  static get observedAttributes() {
    return ['extractable',
            'breadth',
            'color',
            'visibility',
            'raycast',
            'rotation',
            'rotate-to-angles',
            'rotate-by-angles',
            'spin',
            'quad-scale',
            'scale',
            'scale-to',
            'scale-by',
            'extracted-scale',
            'extracted-size',
            'extracted-link',
            'move-to',
            'move-by',
            'src',
            'z-offset'
          ];
  }

  /**
   * An attribute was added, removed, or updated.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    /**
     * Attribute src changed: render node.
     */
    if (name === 'src') {
      this.render();
    }
    /**
     * If any attribute change and there is a volume, Set attribute.
     */
    else if (window.mlWorld && mlWorld[0] && this._quad) {
     setQuadAttributes(this, {[name] : newValue});
    }
  }

  /**
   * Element removed from the DOM.
   */
  disconnectedCallback() {
    /**
     * Delete node and all attached properties.
     */
    deleteNode(this);

    /**
     * Remove 'scroll' event listeners from window.
     */
    unsetScrollable(this);

    /**
     * Remove 'resize' event listeners from window.
     */
    unsetResizeListener(this);

    /**
     * Remove 'stage-change' event listeners from window.
     */
    unsetStageChangeListener(this);
  }

  /*** Element's Properties. ***/

  /**
   * extractable: Element's Property.
   */
  get extractable() {
    return (this.hasAttribute('extractable') && (this.getAttribute('extractable') === '' || this.getAttribute('extractable') === 'true'));
  }
  set extractable(v) {
    if (this.getAttribute('extractable') === v.toString()) return;
    this.setAttribute('extractable', v.toString());
  }

  /**
   * breadth: Element's Property.
   */
  get breadth() {
    return getAttributeInPixel(this.getAttribute('breadth'));
  }
  set breadth(v) {
    if (!isNaN(parseFloat(v))) {
      this.setAttribute('breadth', v.toString());
    }
  }

  /**
   * color: Element's Property.
   */
  get color() {
    return this.getAttribute('color');
  }
  set color(v) {
    if (this.getAttribute('color') === v.toString()) return;
    this.setAttribute('color', v);
  }

  /**
   * visibility: Element's Property.
   */
  get visibility() {
    return this.getAttribute('visibility');
  }
  set visibility(v) {
    if (this.getAttribute('visibility') === v.toString()) return;
    this.setAttribute('visibility', v);
  }

  /**
   * raycast: Element's Property.
   */
  get raycast() {
    return !(this.getAttribute('raycast') === 'false');
  }
  set raycast(v) {
    if (this.getAttribute('raycast') === v.toString()) return;
    this.setAttribute('raycast', v.toString());
  }

  /**
   * rotation: Element's Property.
   */
  get rotation() {
    return this.getAttribute('rotation');
  }
  set rotation(v) {
    this.setAttribute('rotation', v);
  }

  /**
   * rotateToAngles: Element's Property.
   */
  get rotateToAngles() {
    return this.getAttribute('rotate-to-angles');
  }
  set rotateToAngles(v) {
    this.setAttribute('rotate-to-angles', v);
  }

  /**
   * rotateByAngles: Element's Property.
   */
  get rotateByAngles() {
    return this.getAttribute('rotate-by-angles');
  }
  set rotateByAngles(v) {
    this.setAttribute('rotate-by-angles', v);
  }

  /**
   * spin: Element's Property.
   */
  get spin() {
    return this.getAttribute('spin');
  }
  set spin(v) {
    this.setAttribute('spin', v);
  }

  /**
   * quadScale: Element's Property.
   */
  get quadScale() {
    return this.getAttribute('quad-scale');
  }
  set quadScale(v) {
    this.setAttribute('quad-scale', v);
  }

  /**
   * scale: Element's Property.
   */
  get scale() {
    return this.getAttribute('scale');
  }
  set scale(v) {
    this.setAttribute('scale', v);
  }

  /**
   * scaleTo: Element's Property.
   */
  get scaleTo() {
    return this.getAttribute('scale-to');
  }
  set scaleTo(v) {
    this.setAttribute('scale-to', v);
  }

  /**
   * scaleBy: Element's Property.
   */
  get scaleBy() {
    return this.getAttribute('scale-by');
  }
  set scaleBy(v) {
    this.setAttribute('scale-by', v);
  }

  /**
   * extractedScale: Element's Property.
   */
  get extractedScale() {
    return parseFloat(this.getAttribute('extracted-scale'));
  }
  set extractedScale(v) {
    if (this.getAttribute('extracted-scale') === v.toString()) return;
    if (!isNaN(parseFloat(v))) {
      this.setAttribute('extracted-scale', parseFloat(v));
    }
  }

  /**
   * extractedSize: Element's Property.
   */
  get extractedSize() {
    return this.getAttribute('extracted-size');
  }
  set extractedSize(v) {
    if (this.getAttribute('extracted-size') === v.toString()) return;
    this.setAttribute('extracted-size', v);
  }

  /**
   * extractedLink: Element's Property.
   */
  get extractedLink() {
    return this.getAttribute('extracted-link');
  }
  set extractedLink(v) {
    if (this.getAttribute('extracted-link') === v.toString()) return;
    this.setAttribute('extracted-link', v);
  }

  /**
   * moveTo: Element's Property.
   */
  get moveTo() {
    return this.getAttribute('move-to');
  }
  set moveTo(v) {
    this.setAttribute('move-to', v);
  }

  /**
   * moveBy: Element's Property.
   */
  get moveBy() {
    return this.getAttribute('move-by');
  }
  set moveBy(v) {
    this.setAttribute('move-by', v);
  }

  /**
   * src: Element's Property.
   */
  get src() {
    return this.getAttribute('src');
  }
  set src(v) {
    if (this.getAttribute('src') === v.toString()) return;
    this.setAttribute('src', v);
  }

  /**
   * zOffset: Element's Property.
   */
  get zOffset() {
    if (this.hasAttribute('z-offset') && !isNaN(parseFloat(this.getAttribute('z-offset')))) {
      return getAttributeInPixel(this.getAttribute('z-offset'));
    }
    else {
      return DEFULT_Z_OFFSET;
    }
  }
  set zOffset(v) {
    if (!isNaN(parseFloat(v))) {
      this.setAttribute('z-offset', v.toString());
    }
  }

  /*** Stop animations. ***/

  /**
   * Stop all transform animations.
   */
  stopTransformAnimations() {
    if (this._transform) {
      this._transform.stopTransformAnimations();
    }
  }

  /*** Node effects. ***/

  /**
   * fadeOut Node effects.
   */
  fadeOut(speed){
    fadeOut(this, speed);
  }
  /**
   * fadeIn Node effects.
   */
  fadeIn(speed){
    fadeIn(this, speed);
  }
  /**
   * Wiggle Node effects.
   */
  wiggle(axis) {
    wiggle(this, axis);
  }
}; /* end class MlQuad */

window.customElements.define('ml-quad', MlQuad);
