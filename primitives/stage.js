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
    this.requestStageExtends();
  }

  /**
   * Request Stage extends.
   */
  requestStageExtends() {
    /**
     * If no extends attribute.
     */
    if (!this.hasAttribute('extends')) {
      console.warn(`No stage extends attribute provided.`);
      return;
    }

    /**
     * Default extend values to 0.
     */
    let stageExtends = {top:0, right:0, bottom:0, left:0, front:0, back:0};

    let extendValueArr = this.getAttribute('extends').toLowerCase().split(/;/);

    extendValueArr.forEach(extendValue => {
      /**
       * Each value has property name and value (name:value).
       */
      let extendProp = extendValue.split(':');

      /**
       * Expects name and value.
       */
      if (extendProp.length === 2) {
        let extendPropName = extendProp[0].trim();
        let extendPropValue = extendProp[1].trim();

        //TODO: we need to validate measure units meters, pixels, cm %
        stageExtends[extendPropName] = parseFloat(extendPropValue.replace(/\r?\n| |\r|\t|,/gm, ''));
      }
    });

    /**
     * Hide volume during volume re-size and re-position of the volume in mainStageChangedListener and re-position of nodes in setStageChangeListener.
     */
    mlWorld[0].visible = false;
    mlWorld.update();

    /**
     * Prepare MLStageExtension with extends values.
     */
    var stageExt = new MLStageExtension(stageExtends.top, stageExtends.right, stageExtends.bottom, stageExtends.left, stageExtends.front, stageExtends.back);

    /**
     * Request stage size and position.
     */
    window.mlWorld.setStageExtension(stageExt).then((result) => {
      if (result.state == 'denied') {
        /**
         * Permission was denied.
         */
        console.error(`Permission requesting new stage's extends has not been granted.`);
      }
    }).catch((error) => {
      console.error(`There was an error requesting the new stage's extends. Error: ${error.message}`);
    }).finally(() => {
      /**
       * Show volume when setStageExtension is finished.
       */
      mlWorld[0].visible = true;
    });
  }

  /*** Element's Properties. ***/

  /**
   * extends: Element's Property.
   */
  get extends() {
    return this.getAttribute('extends');
  }
  set extends(v) {
    if (this.getAttribute('extends') === v.toString()) return;
    this.setAttribute('extends', v);
  }
};

window.customElements.define('ml-stage', MlStage);
