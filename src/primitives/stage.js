import { createVolume } from '../helpers/createVolume.js'

/**
 * &lt;ml-stage&gt; HTML Custom Element.
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

    /**
     * Check for Volume.
     * If no Volume, create volume.
     */
    if (mlWorld.length === 0) {
      createVolume(this);
    }

    /**
     * Requested Stage.
     */
    this.requestStageExtents();
  }

  /**
   * Request Stage extents.
   */
  requestStageExtents() {
    /**
     * If no extents attribute.
     */
    if (!this.hasAttribute('extents')) {
      console.warn(`No stage extents attribute provided.`);
      return;
    }

    /**
     * Default extent values to 0.
     */
    let stageExtents = {top:0, right:0, bottom:0, left:0, front:0, back:0};

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
        let extentPropValue = extentProp[1].trim();

        //TODO: we need to validate values >0 and the measure units in meters, pixels, cm %
        stageExtents[extentPropName] = parseFloat(extentPropValue.replace(/\r?\n| |\r|\t|,/gm, ''));
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
    var stageExt = new MLStageExtent(stageExtents.top, stageExtents.right, stageExtents.bottom, stageExtents.left, stageExtents.front, stageExtents.back);

    /**
     * Request stage size and position.
     */
    window.mlWorld.setStageExtent(stageExt).then((result) => {
      if (result.state == 'denied') {
        /**
         * Permission was denied.
         */
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
