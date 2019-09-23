import { DEFULT_Z_OFFSET } from '../utilities/constants.js';
import { getAttributeInPixel } from '../utilities/getAttributeInPixel.js';
import { isElementVisible } from '../utilities/isElementVisible.js';

import { createVolume } from '../helpers/createVolume.js';
import { doModelRendering } from '../helpers/doModelRendering.js';
import { doModelInstance } from '../helpers/doModelInstance.js';
import { setModelAttributes } from '../helpers/setModelAttributes.js';
import { setHoverState } from '../helpers/setHoverState.js';
import { setNodeExtraction } from '../helpers/setNodeExtraction.js';
import { setScrollable, unsetScrollable } from '../helpers/setScrollable.js';
import { setMutationObserver } from '../helpers/setMutationObserver.js';
import { setResizeObserver } from '../helpers/setResizeObserver.js';
import { setResizeListener, unsetResizeListener } from '../helpers/setResizeListener.js';
import { setStageChangeListener, unsetStageChangeListener } from '../helpers/setStageChangeListener.js';

/* Effects */
import { fadeOut } from '../effects/fadeOut.js';
import { fadeIn } from '../effects/fadeIn.js';
import { wiggle } from '../effects/wiggle.js';

/**
 * <ml-model> HTML Custom Element.
 */
export class MlModel extends HTMLElement {

  /**
   * An instance of custom element is instantiated.
   */
  constructor() {
    super();

    /**
     * Set fallback image when error rendering model.
     */
    this.addEventListener('error', function(e) {
      if (!this._model && this.hasAttribute('alt-img')) {
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
       * If no Volume, create bounded volume.
       */
      if (mlWorld.length === 0) {
        createVolume(this);
      }

      /* Render. */
      this.doRendering().then(() => {
        /**
         * Node visibility
         */
        this._model.visible = isElementVisible(this) && !(this.visibility === 'hidden');

        /**
         * Check for instances.
         */
        if (this.id) {
          let instances = document.querySelectorAll(`ml-model[instance=${this.id}]`);
          instances.forEach((modelInstance) => {
            /**
             * Render instance of node.
             */
            doModelInstance(modelInstance, this);
            /**
             * Instance visibility.
             */
            if (modelInstance._model) {
              modelInstance._model.visible = isElementVisible(modelInstance) && !(modelInstance.getAttribute('visibility') === 'hidden');
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
   * An alias of doModelRendering.
   */
  doRendering() {
    return doModelRendering(this);
  }

  /**
   * Set names of attributes to observe.
   */
  static get observedAttributes() {
    return ['extractable',
            'breadth',
            'materials',
            'color',
            'visibility',
            'raycast',
            'rotation',
            'rotate-to-angles',
            'rotate-by-angles',
            'model-animation',
            'model-animation-speed',
            'spin',
            'model-scale',
            'scale-to',
            'extracted-scale',
            'extracted-size',
            'extracted-link',
            'move-to',
            'move-by',
            'src',
            'z-offset',
            'environment-lighting'
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
    else if (window.mlWorld && mlWorld[0] && this._model) {
      setModelAttributes(this, {[name] : newValue});
    }
  }

  /**
   * Element removed from the DOM.
   */
  disconnectedCallback() {
    /**
     * Delete node.
     * Nullify all attached properties.
     */
    if (this._model) {
      this._transform.removeChild(this._model);
      this._mainTransform.removeChild(this._transform);
      mlWorld[0].removeChild(this._mainTransform)
    }

    this._model = null;
    this._mainTransform = null;
    this._transform = null;
    this._resource = null;
    this._textures = null;
    this._kmat = null;

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
   * fill: Element's Property.
   */
  get fill() {
    return (this.hasAttribute('fill') && (this.getAttribute('fill') === '' || this.getAttribute('fill') === 'true'));
  }
  set fill(v) {
    if (this.getAttribute('fill') === v.toString()) return;
    this.setAttribute('fill', v.toString());
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
   * materials: Element's Property.
   */
  get materials() {
    return this.getAttribute('materials');
  }
  set materials(v) {
    if (this.getAttribute('materials') === v.toString()) return;
    this.setAttribute('materials', v);
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
   * animation: Element's Property.
   */
  get animation() {
    return this.getAttribute('model-animation');
  }
  set animation(v) {
    this.setAttribute("model-animation", v);
  }

  /**
   * animationSpeed: Element's Property.
   */
  get animationSpeed() {
    return parseFloat(this.getAttribute('model-animation-speed'));
  }
  set animationSpeed(v) {
    if (this.getAttribute('model-animation-speed') === v.toString()) return;
    if (!isNaN(parseFloat(v))) {
      this.setAttribute("model-animation-speed", parseFloat(v));
    }
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
   * modelScale: Element's Property.
   */
  get modelScale() {
    return this.getAttribute('model-scale');
  }
  set modelScale(v) {
    this.setAttribute('model-scale', v);
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

  /**
   * environmentLighting: Element's Property.
   */
  get environmentLighting() {
    return this.getAttribute('environment-lighting');
  }
  set environmentLighting(v) {
    this.setAttribute('environment-lighting', v);
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
};

window.customElements.define('ml-model', MlModel);
