import { createVolume } from '../helpers/createVolume.js'
import { pixelsToMetersSize } from '../utilities/pixelsToMetersSize.js';

/**
 * ml-stage HTML Custom Element.
 */
export class MlStage extends HTMLElement {
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
  }

  /**
   * Set names of attributes to observe.
   */
  static get observedAttributes() {
    return ['extents'];
  }

  /**
   * An attribute was added, removed, or updated.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    /**
     * Request stage.
     */
    if (window.mlWorld) {
      this.requestStageExtents();
    }
  }

  /**
   * Request Stage extents.
   */
  requestStageExtents() {
    /**
     * If no extents attribute.
     */
    if (!this.hasAttribute('extents') || this.getAttribute('extents').trim().length === 0) {
      console.warn(`No stage extents attribute provided.`);
      return;
    }

    /**
     * Check for Volume.
     * If no volume, reset stage and create volume.
     */
    if (window.mlWorld.length === 0) {
      /**
       * Reset stage.
       */
      window.mlWorld.resetStageExtent();

      /**
       * Create volume.
       */
      createVolume(this);
    }


    /**
     * Copy current extent values.
     */
    let stageExtents = {top:mlWorld.stageExtent.top, right:mlWorld.stageExtent.right, bottom:mlWorld.stageExtent.bottom, left:mlWorld.stageExtent.left, front:mlWorld.stageExtent.front, back:mlWorld.stageExtent.back};

    let extentValueArr = this.getAttribute('extents').toLowerCase().split(/;/);

    extentValueArr.forEach(extentValue => {
      /**
       * Each value has property name and value (name:value).
       */
      let extentProp = extentValue.split(':');

      /**
       * Expects name and value.
       */
      if (extentProp.length === 2) {
        let extentPropName = extentProp[0].trim();
        let extentPropValue = parseFloat(extentProp[1]);

        if (extentPropValue) {
          /**
           * Convert px or cm to meters.
           */
          let unitName = extentProp[1].trim().toString().replace(/[^A-Za-z]/g, "").toLowerCase();
          if (unitName === 'cm') {
            extentPropValue = extentPropValue * 0.01; //convert cm to meters
          }
          else if (unitName === 'px') {
            extentPropValue = pixelsToMetersSize(extentPropValue); //convert px to meters
          }
          /**
           * Update value of extent property.
           */
          stageExtents[extentPropName] = extentPropValue;
        }
      }
    });

    /**
     * Hide volume during volume re-size and re-position of the volume in mainStageChangedListener and re-position of nodes in setStageChangeListener.
     */
    mlWorld[0].visible = false;
    mlWorld.update();

    /**
     * Prepare MLStageExtent with extents values.
     */
    let stageExt = new MLStageExtent(stageExtents.top, stageExtents.right, stageExtents.bottom, stageExtents.left, stageExtents.front, stageExtents.back);

    /**
     * Request stage size and position.
     */
    window.mlWorld.setStageExtent(stageExt).then((result) => {
      if (result.state == 'granted') {
        /**
         * Once the stage permission is granted, dispatch mlstage-granted synthetic event.
         */
        this.dispatchEvent(new Event('mlstage-granted', {bubbles: true}));
      }
      if (result.state == 'denied') {
        /**
         * Permission was denied. Dispatch mlstage-denied synthetic event.
         */
        this.dispatchEvent(new Event('mlstage-denied', {bubbles: true}));

        console.error(`Permission requesting new stage's extents has not been granted.`);
      }
    }).catch((error) => {
      console.error(`There was an error requesting the new stage's extents. Error: ${error.message}`);
    }).finally(() => {
      /**
       * Show volume when setStageExtent is finished.
       */
      mlWorld[0].visible = true;
    });
  }

  /*** Element's Properties. ***/

  /**
   * extents: Element's Property.
   */
  get extents() {
    return this.getAttribute('extents');
  }
  set extents(v) {
    if (this.getAttribute('extents') === v.toString()) return;
    this.setAttribute('extents', v);
  }
};

window.customElements.define('ml-stage', MlStage);
