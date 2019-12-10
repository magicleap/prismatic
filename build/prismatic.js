(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.prismatic = {}));
}(this, function (exports) { 'use strict';

  /**
   * Create main JS volume.
   * Returns the JS Volume.
   * @param {HTMLElement} el HTML custom element.
   * @returns {volume} JS Volume object.
   */
  let createVolume = (el) => {
    /**
     * Throw error if volume already exists.
     */
    if (mlWorld.length !== 0) {
      throw new Error('Volume already exists');
    }

    /**
     * Create JS volume using default Stage size.
     * We need to create the volume with a small size and then we need to set the size.
     * We have a limitation to create a volume of a certain size at a certain point.
     */
    let volume = mlWorld.createVolume(0.1, 0.1, 0.1);

    /**
     * Throw error if volume was not created.
     */
    if (!volume) {
      throw new Error('Volume was not created');
    }

    /**
     * Add reference to volume for garbage collection.
     */
    el._volume = volume;

    /**
     * Set volume position to be on top of viewport (default).
     */
    const viewPortPositionTopLeftY = window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y;
    const transformMatrix = new DOMMatrix().translate(0, viewPortPositionTopLeftY, 0);
    volume.transformVolumeRelativeToHostVolume(transformMatrix);

    /**
     * Set size of the volume to match stage size (default)
     */
    volume.setSize(window.mlWorld.stageSize.x, window.mlWorld.stageSize.y, window.mlWorld.stageSize.z);

    /**
     * Volume visibility is hidden by default.
     */
    volume.visible = true;

    /**
     * Listen for animationEnd event and dispatch custom event from HTMLElement.
     */
    volume.addEventListener("mlanimation", (event) => {
      if (event.type === 'animationEnd' && event.model && event.model.htmlElement) {
        let el = event.model.htmlElement;
        let animationEndEvent = new CustomEvent('model-animation-end', {
          detail: { animationName: event.animationName }
        });
        el.dispatchEvent(animationEndEvent);
      }
    });

    /**
     * Listen for mltransformanimation event and dispatch custom event from HTML custom element.
     */
    volume.addEventListener("mltransformanimation", function(event) {
      if (event.node && event.node.htmlElement) {
        let el = event.node.htmlElement;
        let transformAnimationEndEvent = new CustomEvent('transform-animation-end', {
          detail: { track: event.track, type: event.type }
        });
        el.dispatchEvent(transformAnimationEndEvent);
      }
    });

    /**
     * Listen for mlextraction event and dispatch custom mlextraction event from HTML custom element to handle extraction.
     */
    volume.addEventListener("mlextraction", (event) => {
      if (event.targetNode && event.targetNode.htmlElement) {
        let el = event.targetNode.htmlElement;
        el.dispatchEvent(new Event('mlextraction'));
      }
    });

    /**
     * Listen for mlraycast event and dispatch custom event for node from HTML custom element when node is visible.
     * Add inputType property to custom event to differentiate between control and headpos raycast.
     * Dispatch mouseover, mouseout, mousemove from HTLM custome element to handle hover effect on extractable node.
     */
    volume.addEventListener("mlraycast", (event) => {
      if (event.hitData.targetNode && event.hitData.targetNode.htmlElement) {
        let el = event.hitData.targetNode.htmlElement;

        /**
         * Replace any instance of the word "Totem" in the event type to "Control".
         */
        let eventType = event.type.replace(/Totem/g, "Control");

        /**
         * Get node. Either model or quad.
         */
        let node = (el._model ? el._model : el._quad);

        if (node && node.visible) {
          /**
           * Differentiate between control and headpos raycast.
           */
          let inputype = '';
          if (eventType.search(/control/i) >= 0) {
            inputype = 'control';

            if (eventType === 'nodeOnControlEnter') {
              let mouseoverEvent = new MouseEvent('mouseover', { view: window, bubbles: true, cancelable: true });
              el.dispatchEvent(mouseoverEvent);
            }
            else if (eventType === 'nodeOnControlExit') {
              let mouseoutEvent = new MouseEvent('mouseout', { view: window, bubbles: true, cancelable: true });
              el.dispatchEvent(mouseoutEvent);
            }
          }
          else if (eventType.search(/head/i) >= 0) {
            inputype = 'headpos';
          }

          if (event.hitData.type === 'quadNode' || event.hitData.type === 'modelNode'){
            let newRaycastEvent = new CustomEvent('node-raycast', { detail: { inputType: inputype, type: eventType, hitData: event.hitData }});
            el.dispatchEvent(newRaycastEvent);
          }
        }
      }
    });

    return volume;
  };

  /** Default z-offset distance in pixels.  */
  const DEFULT_Z_OFFSET = 150;

  /** De facto standard: 1 pixel = 0.0264583 cm (1in = 96px = 2.54cm) */
  const PIXEL_TO_CM = 0.026458333;

  /** Used for hover mouseover effect to increase the size of the node on mouse over an extractable node.  */
  const MOUSE_OVER_RATIO = 1.25;

  /** Z value used for hover mouseover effect to move the node forward in the z axis on mouse over an extractable node.  */
  const MOUSE_OVER_Z_MOVE = 0.02;

  /** Record PIXEL TO METER. window.mlWorld.viewportWidth = window.innerWidth  */
  const PIXEL_TO_METER = (window.mlWorld ? window.mlWorld.viewportWidth / window.innerWidth : 0);

  /* Used to create a small gab between volume and model. Make the volume slightly bigger than model. */
  const VOLUME_GAP = 0.0001;

  /**
   * Convert from pixels to meters.
   * Returns value in meters.
   * @param {number} pixelValue Pixel value to be converted to meter.
   * @returns {number} Value in meters.
   */
  let pixelsToMetersSize = (pixelValue) => {
    return Math.fround(pixelValue * PIXEL_TO_METER);
  };

  /**
   * ml-stage HTML Custom Element.
   */
  class MlStage extends HTMLElement {
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
       * If no volume, reset stage and create volume.
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
           * Once the stage permission is granted, dispatch stage-granted synthetic event.
           */
          this.dispatchEvent(new Event('stage-granted'));
        }
        if (result.state == 'denied') {
          /**
           * Permission was denied. Dispatch stage-denied synthetic event.
           */
          this.dispatchEvent(new Event('stage-denied'));

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
  }
  window.customElements.define('ml-stage', MlStage);

  /**
   * Return attribute value in pixel.
   * Check for unit name in cm or mm and convert to pixel.
   * Returns value in pixels.
   * @param {string} attributeValue Value to be converted to pixels.
   * @returns {number} Value in pixels
   */
  let getAttributeInPixel = (attributeValue) => {
    let attributeValueInPixel = 0;

    /**
     * Check for unit name in the value and convert to px.
     * If no unit, assume value is in pixel.
     */
    if (parseFloat(attributeValue)) {
      let unitName = attributeValue.toString().replace(/[^A-Za-z]/g, "").toLowerCase();

      if (unitName === 'cm') {
        attributeValueInPixel = parseFloat(attributeValue) / PIXEL_TO_CM ;
      }
      else if (unitName === 'mm') {
        attributeValueInPixel = parseFloat(attributeValue) / PIXEL_TO_CM / 10; //mm
      }
      else {
        attributeValueInPixel = parseFloat(attributeValue);
      }
    }

    return attributeValueInPixel;
  };

  /**
   * Determine if HTML custom element is visible in DOM.
   * Returns HTML custom element visible as a boolean.
   * @param {HTMLElement} el HTML custom element.
   * @returns {boolean} HTML custom element visible.
   */
  let isElementVisible = (el) => {
    if (!el) return false;

    let compStyles = window.getComputedStyle(el, '');
    if (compStyles.display == 'none') return false;
    if (compStyles.visibility == 'hidden') return false;
    if (el.hidden) return false;

    return true;
  };

  /**
   * Validate and parse material attribute values.
   * Returns JSON Object with the material properties (kmat and textures).
   * @param {string} attributeValue Materials attribute value.
   * @returns {JSONObject} Properties for Materials (kmat and textures).
   */
  let parseMaterials = (attributeValue) => {
    let materials = {};

    /**
     * Attribute values delimeted by semi-colon.
     */
    attributeValue.split(/;/).forEach(parameter => {
      /**
       * Each attribute value has property name and value (name:value).
       */
      let parameterArr = parameter.split(':');

      /**
       * Expects name and value.
       */
      if (parameterArr.length === 2) {
        if (parameterArr[0].trim() === 'textures') {
          /**
           * When textures parameter exists, replace commas, newline, tabs with
           * space and remove duplicate spaces to create array.
           */
          materials[parameterArr[0].trim()] = parameterArr[1].trim().replace(/\r?\n|\r|\t|,/gm, ' ').replace(/  +/g, ' ').split(/ /).filter((val) => val.trim());
        }
        else {
          /**
           * Kmat.
           */
          materials[parameterArr[0].trim()] = parameterArr[1].trim();
        }
      }
    });

    /**
     * Validate Kmat.
     */
    if (materials.kmat && materials.textures && materials.textures.length > 0) {
      return materials;
    }
    else {
      console.error('Invalid values used for materials attribute. No materials loaded.');
    }
  };

  /**
   * Iterate through array of textures paths and create an Image HTML element to create textures.
   * Returns the textures.
   * @param {Array.<String>} texturePathArray Path to texture files.
   * @returns {Promise} Promise object represents the textures.
   */
  let createTextures = (texturePathsArr) => {

    return Promise.all(texturePathsArr.map(setImages));

    function setImages(texturePath) {
      return new Promise((resolve, reject) => {
        let img = new Image();

        img.onload = () => {
          resolve(mlWorld[0].createTexture(img, texturePath));
        };
        img.onerror = () => {
          reject(new Error(`Problem loading texture: ${texturePath}.`));
        };

        img.src = texturePath;
      });
    }
  };

  /**
   * Fetch the kmat file and convert to arrayBuffer to create kmat from volume.
   * Returns the kmat.
   * @param {string} kmatPath Path to kmat file
   * @returns {Promise} Promise object represents the kmat.
   */
  let createKMat = async (kmatPath) => {
    let res = await fetch(kmatPath);
    if (res.ok) {
      let data = await res.arrayBuffer();
      return mlWorld[0].createKMat(data, kmatPath);
    } else {
      return Promise.reject(new Error(`Problem creating KMat file: ${kmatPath}`));
    }
  };

  /**
   * Create a model resource and find the shader type.
   * Returns resources object with resource and shader type.
   * @param {HTMLElement} el HTML custom element.
   * @param {string} modelSrc Path to model file.
   * @returns {Promise} Promise object represents the resources.
   */
  let loadResource = async (el, modelSrc) => {
    /* Check for valid file extension */
    let modelValidExtRe = new RegExp(/\.(fbx|glb)(\?|#|$)/i);
    if (!modelValidExtRe.test(modelSrc)) {
      let modelTypeError = new Error(`Invalid model file extension: ${modelSrc}. Only FBX and GLB are supported at the moment.`);
      return Promise.reject(modelTypeError);
    }

    /**
     * Fetch modelSrc path and conver to arrayBuffer
     */
    let res = await fetch(modelSrc);

    if (res.ok) {
      let data = await res.arrayBuffer();

      /**
       * Find shader bases on the model file type.
       * When glb file, use Pbr as shader. Validate glb file by checking the first 4 bytes are glTF.
       * When fbx file, use UnlitTextured as shader. Validate fbx file by checking the first 20 bytes are Kaydara FBX Binary .
       */
      let shader = "";
      /* Check for GLB. */
      if (modelSrc.match(/\.glb(\?|#|$)/i) && String.fromCharCode.apply(null, new Uint8Array(data, 0, 4)) === "glTF") {
        shader = "Pbr";
      }
      /* Check for FBX. */
      else if (modelSrc.match(/\.fbx(\?|#|$)/i) && String.fromCharCode.apply(null, new Uint8Array(data, 0, 23)) === "Kaydara FBX Binary\x20\x20\x00\x1a\x00") {
        shader = "UnlitTextured";
      }
      /* Invalid file. */
      else {
        let modelTypeError = new Error(`Invalid model file: ${modelSrc}. Only FBX and GLB are supported at the moment.`);
        return Promise.reject(modelTypeError);
      }

      /**
       * Create a model resource from volume.
       */
      let resource = mlWorld[0].createModelResource(data);

      /**
       * Add kmat to resource.
       */
      if (el._kmat) {
        resource.kmat = el._kmat;
      }

      /**
       * Check if valid resource.
       */
      if (resource) {
        return {resource: resource, shader:shader};
      } else {
        return Promise.reject(new Error(`Load resource failed: ${modelSrc}`));
      }
    }
    else {
      return Promise.reject(new Error(`Load resource failed: ${modelSrc}`));
    }
  };

  /**
   * Set skipRaycast on a node.
   * If raycast attribute is set to false, skip node raycast.
   * @param {HTMLElement} el HTML custom element.
   * @param {boolean} [skipRaycast=false]
   */
  let setSkipRaycast = (node, skipRaycast = false) => {
    node.skipRaycast = skipRaycast;
  };

  /**
   * The scale attribute value is parsed and added to transform.setLocalScale().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} nodeScale Node scale attribute value.
   */
  let setScale = (el, nodeScale) => {
    if (nodeScale) {
      if (el._transform) {
        /**
         * Replace all non alphanumeric with a space.
         * Create scale array and cast to float.
         */
        let nodeScaleArr = nodeScale.trim().replace(/[^\d.-]+/g, ' ').split(' ').map(parseFloat).filter((val) => !isNaN(val));
        el._transform.setLocalScale(new Float32Array(nodeScaleArr));
      }
    }
  };

  /**
   * Convert angle from degrees to radians.
   * Returns the angle in radians.
   * @param {float} angle Angle in degrees to be converted to radians.
   * @returns {float} Angle in radians.
   */
  let degreesToRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  /**
   * Parse and validate rotation attribute values.
   * Returns array with rotation in radians.
   * @param {string} rotation Rotation attribute value.
     @returns {number[]} Array with rotation in radians.
   */
  let parseRotation = (rotation) => {
    /**
     * Replace all non-alphanumeric with a space. Create array and cast to float.
     */
    let rotationArr = rotation.trim().replace(/[^\d.-]+/g, ' ').split(' ').map(parseFloat).filter((val) => !isNaN(val));

    /**
     * Check if rotation values are in degrees by checking for string 'deg'.
     * Convert to radians.
     */
    if ((rotation.toLowerCase().split('deg').length - 1) > 0) {
      rotationArr = rotationArr.map((val) => degreesToRadians(val));
    }

    /**
     * Validate rotation array length.
     */
    if (rotationArr && rotationArr.length === 3) {
      return rotationArr;
    }
    else {
      console.error('Invalid values used for rotation attribute.');
    }
  };

  /**
   * Conversion of axes angle rotation to Quaternion.
   * Returns array with rotation in quaternion.
   * @param {number[]} Axis Angle rotation values in array.
   * @returns {number[]} Rotation in quaternion.
   */
  let angleToQuaternion = (angleArray) => {
  	let c1 = Math.cos(angleArray[0] / 2),
        c2 = Math.cos(angleArray[1] / 2),
        c3 = Math.cos(angleArray[2] / 2),
        s1 = Math.sin(angleArray[0] / 2),
        s2 = Math.sin(angleArray[1] / 2),
        s3 = Math.sin(angleArray[2] / 2),
  			w = c1 * c2 * c3 + s1 * s2 * s3,
  	    x = s1 * c2 * c3 - c1 * s2 * s3,
  	    y = c1 * s2 * c3 + s1 * c2 * s3,
  	    z = c1 * c2 * s3 - s1 * s2 * c3;

    return [x, y, z, w];
  };

  /**
   * The rotation attribute value is parsed and set a quaternion.
   * @param {HTMLElement} el HTML custom element.
   * @param {string} rotation Rotation attribute value.
   */
  let setRotation = (el, rotation) => {
    /**
     * Parse rotation attribute values and map to quaternions.
     */
    if (rotation) {
      let rotationQuaternionArr = angleToQuaternion(parseRotation(rotation));
      if (rotationQuaternionArr && el._transform) {
        el._transform.setLocalRotation(new Float32Array(rotationQuaternionArr));
      }
    }
  };

  /**
   * Parse and validate model-animation attribute values.
   * Attribute value could be in key:value format (name:name;paused:true;iterations:12) or just values delimeted by , (name, true, 12)
   * Use default values of false for paused and -1 for interactions.
   * Returns JSON Object with the model animation properties (name, paused and iterations).
   * @param {string} attributeValue Model animation attribute value.
   * @returns {JSONObject} Properties for model animation (name, paused and iterations).
   */
  let parseModelAnimation = (attributeValue) => {
    let animation = {};
    let animationProps = ['name', 'paused', 'iterations'];

    /**
     * Attribute parameter values delimeted by semi-colon or comma.
     */
    let attributeValueArr = attributeValue.split(/;|,/);

    attributeValueArr.forEach((parameter, i) => {
      /**
       * Each attribute value may have property name and value (name:value).
       */
      let parameterArr = parameter.split(':');

      /**
       * Property name and value (name:name; paused: false; iterations: 3;).
       */
      if (parameterArr.length === 2) {
        /**
         * Get numeric values and create array.
         */
        animation[parameterArr[0].trim()] = parameterArr[1].trim();
      }
      /**
       * No property name and value. Just property values (name, paused, iterations).
       */
      else if (parameterArr.length === 1) {
        animation[animationProps[i]] = parameterArr[0].trim();
      }
    });

    /**
     * Attribute validation.
     */
    if (!animation.name) {
      console.error('No animation name found in animation attribute.');
      return;
    }

    /**
     * If no paused property exists, set default value and show warning.
     */
    if (!animation.paused) {
      animation.paused = false;
      console.warn('Invalid paused value for animation attribute. Default value of false used.');
    }
    /**
     * Set paused property to boolean.
     */
    else {
      animation.paused = ((animation.paused === "false" || animation.paused ===  "no" || animation.paused ===  "0" || animation.paused === "") ? false : true);
    }

    /**
     * If no iterations property, set default value and show warning.
     */
    if (isNaN(parseInt(animation.iterations))) {
      animation.iterations = -1;
      console.warn('Invalid iterations value for model-animation attribute. Default value of -1 used.');
    }
    else {
      animation.iterations = parseInt(animation.iterations);
    }

    return animation;
  };

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

  /**
   * The spin attribute value is validated, parsed and added to transform.spin().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} spinAttributeValue Spin attribute value.
   */
  let setSpin = (el, spinAttributeValue) => {
    if (spinAttributeValue) {
      let spinBol = true;

      /**
       * Parse arguments: axis, angle, duration, track.
       */
      let nodeSpin = parseAnimation(spinAttributeValue, spinBol);

      if (nodeSpin){
        el._transform.spin(new Float32Array(nodeSpin.axes), nodeSpin.angle, nodeSpin.duration, nodeSpin.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeSpin.track);
      }
    }
  };

  /**
   * The scaleTo attribute value is parsed, validated and added to transform.scaleTo().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} scaleToAttributeValue scaleTo attribute value.
    */
  let setScaleTo = (el, scaleToAttributeValue) => {
    if (scaleToAttributeValue) {
      /**
       * Parse arguments: scaleTo, duration, track.
       */
      let nodeScaleTo = parseAnimation(scaleToAttributeValue);

      if (nodeScaleTo) {
        el._transform.scaleTo(new Float32Array(nodeScaleTo.axes), nodeScaleTo.duration, nodeScaleTo.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeScaleTo.track);
      }
    }
  };

  /**
   * The scaleBy attribute value is parsed, validated and added to transform.scaleBy().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} scaleByAttributeValue scaleBy attribute value.
    */
  let setScaleBy = (el, scaleByAttributeValue) => {
    if (scaleByAttributeValue) {
      /**
       * Parse arguments: scaleBy, duration, track.
       */
      let nodeScaleBy = parseAnimation(scaleByAttributeValue);

      if (nodeScaleBy) {
        el._transform.scaleBy(new Float32Array(nodeScaleBy.axes), nodeScaleBy.duration, nodeScaleBy.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeScaleBy.track);
      }
    }
  };

  /**
   * Calculate coordinates using DOM element's X and Y coordinates.
   * Returns postion coordinates.
   * @param {HTMLElement} el HTML custom element.
   * @returns {number[]} XYZ Coordinates.
   */
  let getCoordinates = (el) => {
    let position = el.getBoundingClientRect();

    /**
     * Distance from left to center of element.
     */
    let positionX = getXCoordinate(position.left + (el.clientWidth/2)) + (window.mlWorld.stageExtent.left - window.mlWorld.stageExtent.right)/2;

    /**
     * Distance from top to center of element.
     */
    let positionY = getYCoordinate(position.top + (el.clientHeight/2)) + (window.mlWorld.stageExtent.bottom - window.mlWorld.stageExtent.top)/2;

    /**
     * Distance of element on Z axes (forward or backward).
     */
    let positionZ = getZCoordinate(el.zOffset) + (window.mlWorld.stageExtent.back - window.mlWorld.stageExtent.front)/2;

    return {
      positionX,
      positionY,
      positionZ
    }
  };

  let getXCoordinate = (value) => {
    let x = pixelsToMetersSize(value) - (window.mlWorld.viewportWidth / 2) ;
    return Math.fround(x);
  };

  let getYCoordinate = (value) => {
    let y = (window.mlWorld.viewportHeight / 2) - pixelsToMetersSize(value);
    return Math.fround(y);
  };

  let getZCoordinate = (value = DEFULT_Z_OFFSET) => {
    let z = pixelsToMetersSize(value);
    return Math.fround(z);
  };

  /**
   * Calculate coordinates using offset values from offset parameter in moveTo attribute.
   * Returns postion coordinates.
   * @param {HTMLElement} el HTML custom element.
   * @param {string[]} Offset values in array.
   * @returns {number[]} XYZ Coordinates.
   */
  let getOffsetCoordinates = (el, offsetArr) => {
    /**
     * Get offset values for each axis.
     * If offset value is not available, return undefined.
     */
    let offsetPositionArr = getOffsetValues(offsetArr);

    /**
     * If offset value is numeric, calculate distance from center of volume (0,0,0).
     * If offset value is undefined, use current location.
     */
    let x = (!isNaN(parseFloat(offsetPositionArr[0]))) ? getXCoordinate(offsetPositionArr[0]) + (window.mlWorld.stageExtent.left - window.mlWorld.stageExtent.right)/2 : el._mainTransform.getLocalPosition()[0];
    let y = (!isNaN(parseFloat(offsetPositionArr[1]))) ? getYCoordinate(offsetPositionArr[1]) + (window.mlWorld.stageExtent.bottom - window.mlWorld.stageExtent.top)/2 : el._mainTransform.getLocalPosition()[1];
    let z = (!isNaN(parseFloat(offsetPositionArr[2]))) ? getZCoordinate(offsetPositionArr[2]) + (window.mlWorld.stageExtent.back - window.mlWorld.stageExtent.front)/2 : el._mainTransform.getLocalPosition()[2];

    return [x, y, z];
  };

  /***
   * Get offset values.
   * Return undefined if offset value is not available.
   */
  let getOffsetValues = (offsetArr) => {
    let leftOffsetValue, topOffsetValue, zOffsetValue;

    /**
     * X-axis offset.
     */
    switch(offsetArr[0]) {
      case 'left':
        leftOffsetValue = 0;
        break;
      case 'middle':
      case 'center':
        leftOffsetValue = window.outerWidth / 2;
        break;
      case 'right':
        leftOffsetValue = window.outerWidth;
        break;
      default:
        leftOffsetValue = !isNaN(parseFloat(offsetArr[0])) ? parseFloat(offsetArr[0]) : undefined;
    }

    /**
     * Y-axis offset.
     */
    switch(offsetArr[1]) {
      case 'top':
        topOffsetValue = 0;
        break;
      case 'middle':
      case 'center':
        topOffsetValue = window.outerHeight / 2;
        break;
      case 'bottom':
        topOffsetValue = window.outerHeight;
        break;
      default:
        topOffsetValue = !isNaN(parseFloat(offsetArr[1])) ? parseFloat(offsetArr[1]) : undefined;
    }

    /**
     * Z-axis offset.
     */
    zOffsetValue = !isNaN(parseFloat(offsetArr[2])) ? parseFloat(offsetArr[2]) : undefined;

    return [leftOffsetValue, topOffsetValue, zOffsetValue]
  };

  /**
   * The move-to attribute value is validated, parsed, converted to meters and added to transform.moveBy().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} moveToAttributeValue Attribute moveTo value.
   */
  let setMoveTo = (el, moveToAttributeValue) => {
    if (moveToAttributeValue) {
      /**
       * Parse arguments: offset or axes, duration, track.
       */
      let nodeMoveTo = parseAnimation(moveToAttributeValue);

      if (nodeMoveTo) {
        let nodeDestination;

        if (nodeMoveTo.offset) {
          /**
           * Return array of the coordinates from offset values.
           */
          nodeDestination = getOffsetCoordinates(el, nodeMoveTo.offset);
        }
        else if (nodeMoveTo.axes) {
          /**
           * Return array of the coordinates from axes values.
           */
          nodeDestination = getOffsetCoordinates(el, nodeMoveTo.axes);
        }

        /* Do the transform animation */
        el._transform.moveTo(new Float32Array(nodeDestination), nodeMoveTo.duration, nodeMoveTo.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeMoveTo.track);
      }
    }
  };

  /**
    * The move-by attribute value is validated, parsed, converted to meters and added to transform.moveBy().
  	* @param {HTMLElement} el HTML custom element.
    * @param {string} moveByAttributeValue Attribute moveBy value.
    */
  let setMoveBy = (el, moveByAttributeValue) => {
    if (moveByAttributeValue) {
      /**
       * Parse arguments: moveby, duration, track.
       */
      let nodeMoveBy = parseAnimation(moveByAttributeValue);

      if (nodeMoveBy && nodeMoveBy.axes) {
        /**
         * Map moveBy axis values to pixels.
         */
        let moveByValues = nodeMoveBy.axes.map(pixelsToMetersSize);

        /* Do the transform animation */
        el._transform.moveBy(new Float32Array(moveByValues), nodeMoveBy.duration, nodeMoveBy.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation is finished.*/
        el._transform.addMoveCallback(nodeMoveBy.track);
      }
      else {
        console.error(`Invalid axis values used for animation attribute. ${el.id}`);
      }
    }
  };

  /**
   * The rotate-to-angles attribute value is validated, parsed and added to transform.rotateToAngles().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} attributeValue RotateToAngles attribute value.
   */
  let setRotateToAngles = (el, attributeValue) => {
    if (attributeValue) {
      let nodeRotation = parseAnimation(attributeValue);

      if (nodeRotation) {
        el._transform.rotateToAngles(new Float32Array(nodeRotation.angles), nodeRotation.duration, nodeRotation.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeRotation.track);
      }
    }
  };

  /**
   * The rotate-by-angles attribute value is validated, parsed and added to transform.rotateByAngles().
   * @param {HTMLElement} el HTML custom element.
   * @param {string} attributeValue RotateByAngles attribute value.
   */
  let setRotateByAngles = (el, attributeValue) => {
    if (attributeValue) {
      let nodeRotation = parseAnimation(attributeValue);

      if (nodeRotation) {
        el._transform.rotateByAngles(new Float32Array(nodeRotation.angles), nodeRotation.duration, nodeRotation.track);

        /* Calling addMoveCallback to have a mltransformanimation event sent back when animation has finished.*/
        el._transform.addMoveCallback(nodeRotation.track);
      }
    }
  };

  /**
   * Get the size from the HTML Custom Element.
   * Returns JSON object with width, height and breadth.
   * @param {HTMLElement} el HTML custom element.
   * @returns {JSONObject} Width, height and breadth.
   */
  let getHTMLElementSize = (el) => {
    return {
      width: pixelsToMetersSize(el.clientWidth),
      height: pixelsToMetersSize(el.clientHeight),
      breadth: el.breadth ? pixelsToMetersSize(el.breadth) : pixelsToMetersSize(Math.max(el.clientWidth, el.clientHeight))
    };
  };

  /**
   * Conversion Quaternion to Angle.
   * Returns array with angle of rotation.
   * @param {number[]} quaternionArray rotation angle values in array.
   * @returns {number[]} Rotation in axis angles.
   */
  let quaternionToAngle = (quaternionArray) => {
    let angle = 2 * Math.acos(quaternionArray[3]);

    let x = quaternionArray[0] * angle;
    let y = quaternionArray[1] * angle;
    let z = quaternionArray[2] * angle;

    if (1 - (quaternionArray[3] * quaternionArray[3]) >= 0.000001) {
      let s = Math.sqrt(1 - (quaternionArray[3] * quaternionArray[3]));
      x = quaternionArray[0] / s * angle;
      y = quaternionArray[1] / s * angle;
      z = quaternionArray[2] / s * angle;
    }

    return [x, y, z];
  };

  /**
   * Add mlextraction event listener to the HTML custom element to handle extraction.
   * @param {HTMLElement} el HTML custom element.
   */
  let setNodeExtraction = (el) => {
    if (el) {
      el.addEventListener('mlextraction', handleExtraction, false);
    }
  };

  /**
   * Remove mlextraction event listener from the node.
   * @param {HTMLElement} el HTML custom element.
   */
  let unsetNodeExtraction = (el) => {
    if (el) {
      el.removeEventListener('mlextraction', handleExtraction, false);
    }
  };

  /**
   * Node extraction handler.
   * @param {HTMLElement} el HTML custom element.
   */
  let handleExtraction = (e) => {
    /**
     * Consume click event dispatched after long press when event is generated from HTML custom element.
     * isTrusted is true when mlextraction event is dispatched from HTML element.
     */
    if (e.isTrusted) {
      /**
       * Consume click event dispatched by API after long press.
       */
      window.addEventListener('click',  e => e.stopPropagation(), { once: true, capture: true });
    }

    /**
     * Assign element to local variable.
     */
    let el = e.target;

    /**
     * Get node. Either model or quad.
     */
    let node = (el._model ? el._model : el._quad);

    /**
     * Extract node.
     */
    if (node && node.visible) {
      /**
       * Set model size to original (before mouse hoverover effect).
       */
      if (el._originalScale) {
        el._mainTransform.setLocalScale(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]));
      }

      /**
       * Set node position back to original (before mouse hoverover effect).
       */
      if (el._originalPosition) {
        el._mainTransform.setLocalPosition(new Float32Array([el._originalPosition[0], el._originalPosition[1], el._originalPosition[2]]));
      }

      /**
       * Get current postion in main transform.
       */
      let [mainTransformPositionX, mainTransformPositionY, mainTransformPositionZ] = el._mainTransform.getLocalPosition();

      /**
       * Get current postion in animation transform.
       */
      let [aniTransformPositionX, aniTransformPositionY, aniTransformPositionZ] = el._transform.getLocalPosition();

      /**
       * Get node scale.
       */
      let [nodeScaleWidth, nodeScaleHeight, nodeScaleBreadth] = node.getLocalScale();

      /**
       * Get main transform scale.
       */
      let [mainTransformScaleWidth, mainTransformScaleHeight, mainTransformScaleBreadth] = el._mainTransform.getLocalScale();

      /**
       * Get current size of the node. To be used for volume of extracted node.
       */
      let currentNodeWidth, currentNodeHeight, currentNodeBreadth;
      if (el._model) {
        [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [el._resource.width * nodeScaleWidth * mainTransformScaleWidth, el._resource.height * nodeScaleHeight * mainTransformScaleHeight, el._resource.depth * nodeScaleBreadth * mainTransformScaleBreadth];
      } else if (el._quad) {
        [currentNodeWidth, currentNodeHeight, currentNodeBreadth] = [nodeScaleWidth * mainTransformScaleWidth, nodeScaleHeight * mainTransformScaleHeight, nodeScaleBreadth * mainTransformScaleBreadth];
      }

      /**
       * Assign current size to eSise which is used to set the extracted volume size.
       */
      let [eWidth, eHeight, eBreadth] = [currentNodeWidth, currentNodeHeight, currentNodeBreadth];

      /**
       * Set the node size to extracted size attribute value.
       */
      if (el.extractedSize) {
        /**
         * Get the extracted size and validate value.
         */
        [eWidth, eHeight, eBreadth] = el.extractedSize.replace(/  +/g, ' ').split(' ').map(parseFloat);

        /**
         * When breadth is not available, use the min of extracted width and height size for models or 0.001 for quads.
         */
        if (isNaN(eBreadth)) {
          eBreadth = (el._quad) ? VOLUME_GAP : Math.min(eWidth, eHeight);
        }

        /**
         * Validate extracted size values.
         */
        if (isNaN(eWidth) || isNaN(eHeight) || isNaN(eBreadth)) {
          console.warn(`Invalid value used for extracted-size attribute.`);
          return;
        }

        /**
         * Calculate scale to get to extracted-size.
         */
        let scaleToExtractedSizeWidth = eWidth / currentNodeWidth;
        let scaleToExtractedSizeHeight = eHeight / currentNodeHeight;
        let scaleToExtractedSizeBreadth = eBreadth / currentNodeBreadth;

        /**
         * Calculate minumun scale to uniformly scale model to match current dimensions on page.
         */
        let scaleDownRatio = Math.min(currentNodeWidth / eWidth, currentNodeHeight / eHeight);

        /**
         * When scaling down, multiply the scaleDownRatio to transform and assign the oposite to extracted scale.
         * Get the new size of scale down node to calculate the extracted volume size (doExtraction).
         * This is done so the extracted model appears with the same size as the model on the page and then it will scale up.
         */
        if (scaleDownRatio < 1) {
          scaleToExtractedSizeWidth *= scaleDownRatio;
          scaleToExtractedSizeHeight *= scaleDownRatio;
          scaleToExtractedSizeBreadth *= scaleDownRatio;

          [eWidth, eHeight, eBreadth] = [currentNodeWidth * scaleToExtractedSizeWidth, currentNodeHeight * scaleToExtractedSizeHeight, currentNodeBreadth * scaleToExtractedSizeBreadth];

          el.extractedScale = 1 / scaleDownRatio;
        }

        /**
         * Set the extracted node size.
         */
        el._mainTransform.setLocalScale(new Float32Array([mainTransformScaleWidth * scaleToExtractedSizeWidth, mainTransformScaleHeight * scaleToExtractedSizeHeight, mainTransformScaleBreadth * scaleToExtractedSizeBreadth]));
      }//end extracted-size

      /**
       * Dispatch pre node-extracted synthetic event.
       */
      el.dispatchEvent(new Event('extracting-node'));

      /**
       * Set the node in middle of main transform.
       */
      el._mainTransform.setLocalPosition(new Float32Array([0, 0, 0]));

      /**
       * Set the node in middle of animation transform.
       */
      el._transform.setLocalPosition(new Float32Array([0, 0, 0]));

      /**
       * Calculate Z position for the extracted node.
       */
      let newPositionZ;
      if (el._model) {
        newPositionZ = aniTransformPositionZ + mainTransformPositionZ + (el._resource.depth * el._model.getLocalScale()[2]);
      } else if (el._quad) {
        newPositionZ = aniTransformPositionZ + mainTransformPositionZ;
      }

      /**
       * Create Matrix with position for the extracted node.
       */
      let transformMatrix = new DOMMatrix().translate(aniTransformPositionX + mainTransformPositionX + (window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, aniTransformPositionY + mainTransformPositionY + (window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y) + (window.mlWorld.stageExtent.top - window.mlWorld.stageExtent.bottom)/2, newPositionZ + (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2);

      /***
       * Call extractContent on transform.
       * Provide Matrix and size of the node to be extracted.
       */
      doExtraction(el, transformMatrix, {width:eWidth, height:eHeight, breadth: eBreadth});

      /**
       * Resize node back to original in main Transform.
       */
      el._mainTransform.setLocalScale(new Float32Array([mainTransformScaleWidth, mainTransformScaleHeight, mainTransformScaleBreadth]));

      /**
       * Set the node's postion back to original in main transform.
       */
      el._mainTransform.setLocalPosition(new Float32Array([mainTransformPositionX, mainTransformPositionY, mainTransformPositionZ]));

      /**
       * Set the node's position back to original in animation transform.
       */
      el._transform.setLocalPosition(new Float32Array([aniTransformPositionX, aniTransformPositionY, aniTransformPositionZ]));
    }
  };

  /**
   * Do extraction of node.
   * Dispatch node-extracted event.
    * @param {HTMLElement} el HTML custom element.
  	* @param {DOMMatrix} transformMatrix Position of extracted node.
  	* @param {JSONObject} eSize Size of volume of extracted node.
   */
  let doExtraction = (el, transformMatrix, eSize) => {
    /**
     * Use extractedScale if specified, otherwise set extractedScale to 1.
     */
    let extractedScale = el.extractedScale ? el.extractedScale : 1;

    /**
     * Check for specified path.
     * If no path is specified default to current site.
     */
    let path = (el.extractedLink) ? el.extractedLink : window.location.href;

    /**
     * If animated model, the AABB could be wrong.
     * Use the size from HTML custom element, when no extracted Size.
     */
    if (el.animation && !el.extractedSize) {
      let { width, height, breadth } = getHTMLElementSize(el);
      eSize.width   = width;
      eSize.height  = height;
      eSize.breadth = breadth;
    }

    /**
     * If node rotation in any of the axes, calculate size of volume hosting the node after rotation.
     */
    if (el._transform.getLocalRotation().some(angle => angle !== 0)) {
      /**
       * Get the quaternion rotation from transform and convert to axes angles.
       */
      let rotationAngleArr = quaternionToAngle(el._transform.getLocalRotation());

      // roation on x axes
      if (rotationAngleArr[0]) {
        let breadth = Math.abs(Math.sin(rotationAngleArr[0])) * eSize.height + Math.abs(Math.cos(rotationAngleArr[0])) * eSize.breadth;
        let height = Math.abs(Math.sin(rotationAngleArr[0])) * eSize.breadth + Math.abs(Math.cos(rotationAngleArr[0])) * eSize.height;

        eSize.breadth = Math.max(eSize.breadth, breadth);
        eSize.height = Math.max(eSize.height, height);
      }

      // roation on y axes
      if (rotationAngleArr[1]) {
        let width = Math.abs(Math.sin(rotationAngleArr[1])) * eSize.breadth + Math.abs(Math.cos(rotationAngleArr[1])) * eSize.width;
        let breadth = Math.abs(Math.sin(rotationAngleArr[1])) * eSize.width + Math.abs(Math.cos(rotationAngleArr[1])) * eSize.breadth;

        eSize.width = Math.max(eSize.width, width);
        eSize.breadth = Math.max(eSize.breadth, breadth);
      }

      // roation on z
      if (rotationAngleArr[2]) {
        let width = Math.abs(Math.sin(rotationAngleArr[2])) * eSize.height + Math.abs(Math.cos(rotationAngleArr[2])) * eSize.width;
        let height = Math.abs(Math.sin(rotationAngleArr[2])) * eSize.width + Math.abs(Math.cos(rotationAngleArr[2])) * eSize.height;

        eSize.width = Math.max(eSize.width, width);
        eSize.height = Math.max(eSize.height, height);
      }
    }

    /**
     * Extract content with dictionary manifest
     */
    el._mainTransform.extractContent({
      scale: extractedScale,
      transform: transformMatrix,
      doIt: "auto",
      origin_url: path,
      width: eSize.width + VOLUME_GAP,
      height: eSize.height + VOLUME_GAP,
      breadth: eSize.breadth + VOLUME_GAP
    });

    /**
     * Dispatch node-extracted synthetic event.
     */
    el.dispatchEvent(new Event('node-extracted'));
  };

  /**
   * Add effects on node set as extractable.
   * Add mouseover event listener to increase the size of the node and move node on the z-axis on mouseover.
   * Add mouseout event listener to reset to node size and z-position on mouseout.
   * @param {HTMLElement} el HTML custom element.
   */
  let setHoverState = (el) => {
    /**
     * Change the style of the mouse cursor.
     * NOTE Grab not currently supported. Use vendor-prefixed -webkit-grab.
     */
    el.style.cursor = "-webkit-grab";

    /**
     * Add event Listeners for mouse over and out.
     */
    el.addEventListener('mouseover', handleHoverStateMouseOverListener);
    el.addEventListener('mouseout',  handleHoverStateMouseOutListener);
  };

  /**
   * Remove mouseover event listener.
   * Remove mouseout event listener.
   */
  let unsetHoverState = (el) => {
    /**
     * Reset the style of the mouse cursor.
     */
    el.style.cursor = "auto";

    /**
     * Remove event Listeners for mouse over and out.
     */
    el.removeEventListener('mouseover', handleHoverStateMouseOverListener);
    el.removeEventListener('mouseout',  handleHoverStateMouseOutListener);
  };

  /**
   * Debounce mouseover event on an extractable node.
   */
  let handleHoverStateMouseOverListener = (e) => {
    /**
     * Debounce mouseover event to 250ms.
     */
    clearTimeout(e.target._mouseoverTimeoutId);
    e.target._mouseoverTimeoutId = setTimeout(() => handleHoverStateMouseOver(e), 250);
  };

  /**
   * Handle mouseover event on an extractable node.
   */
  let handleHoverStateMouseOver = (e) => {
    /**
     * Assign element to local variable.
     */
    let el = e.target;

    /**
     * Get node. Either model or quad.
     */
    let node = (el._model ? el._model : el._quad);

    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Handle mouseover if volume and node is visible and last hover event was not a mouseover.
     */
    if (volume && volume.visible && node && node.visible && el._lastHoverEvent !== 'mouseover') {
      /**
       * Send control haptic tick on hover.
       */
      if (typeof volume.triggerControlHaptic === 'function') {
        volume.triggerControlHaptic("VIBE_TICK");
      }

      /**
       * Record current scale.
       */
      if (!el._originalScale) {
        el._originalScale = el._mainTransform.getLocalScale();
      }

      /**
       * Set mouseover node scale.
       */
      el._mainTransform.scaleTo(new Float32Array([el._originalScale[0] * MOUSE_OVER_RATIO, el._originalScale[1] * MOUSE_OVER_RATIO, el._originalScale[2] * MOUSE_OVER_RATIO]), 0.1, -1);

      /**
       * Record current position.
       */
      if (!el._originalPosition) {
        el._originalPosition = el._mainTransform.getLocalPosition();
      }

      /**
       * Set mouseover node move z-position.
       */
      el._mainTransform.moveTo(new Float32Array([el._originalPosition[0], el._originalPosition[1], (el._originalPosition[2] + MOUSE_OVER_Z_MOVE)]), 0.1, -2);

      /**
       * Record last hover event.
       */
      el._lastHoverEvent = 'mouseover';
      /**
       * Record if last event was generated from HTML element.
       */
      el._lastHoverEventHtml = e.isTrusted;
    }
  };

  /**
   * Debounce mouseout event on an extractable node.
   */
  let handleHoverStateMouseOutListener = (e) => {
    /**
     * Debounce mouseout event to 250ms.
     */
    clearTimeout(e.target._mouseoutTimeoutId);
    e.target._mouseoutTimeoutId = setTimeout(() => handleHoverStateMouseOut(e), 250);
  };

  /**
   * Handle mouseout event on an extractable node.
   */
  let handleHoverStateMouseOut = (e) => {
    /**
     * Assign element to local variable.
     */
    let el = e.target;

    /**
     * Get node. Either model or quad.
     */
    let node = (el._model ? el._model : el._quad);

    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Handle mouseover event if node and last hover event event was not a mouseout.
     */
    if (node && el._lastHoverEvent === 'mouseover') {
      /**
       * Don't handle mouseout effect when last mouseover event was generated from HTML and current mouseout event is from raycast.
       */
      if (el._lastHoverEventHtml && !e.isTrusted) {
        return;
      }

      /**
       * Send control haptic vibe on hover.
       */
      if (typeof volume.triggerControlHaptic === 'function') {
        volume.triggerControlHaptic("VIBE_FORCE_DWELL");
      }

      /**
       * Set mouseover node move z.
       */
      if (el._originalPosition) {
        el._mainTransform.moveTo(new Float32Array([el._originalPosition[0], el._originalPosition[1], el._originalPosition[2]]), 0.1, -1);
      }

      /**
       * Reset mouseeover node scale.
       */
      if (el._originalScale) {
        el._mainTransform.scaleTo(new Float32Array([el._originalScale[0], el._originalScale[1], el._originalScale[2]]), 0.1, -2);
      }

      /**
       * Record last hover event.
       */
      el._lastHoverEvent = 'mouseout';
      /**
       * Record if last event was generated from HTML element.
       */
      el._lastHoverEventHtml = e.isTrusted;
    }
  };

  /**
   * Reset properties set on setHoverState module.
   * @param {HTMLElement} el HTML custom element.
   */
  let resetOriginalSizePosition = (el) => {
    delete el._originalPosition;
    delete el._originalScale;
  };

  /**
   * Position the node on top of its HTMl Custom Element.
   * @param {HTMLElement} el HTML custom element.
   */
  let setNodePosition = (el) => {
    if (el._mainTransform) {
      /**
       * Set node position.
       * Get the position, convert to meters and find mlWorld coordinates.
       */
      let { positionX, positionY, positionZ } = getCoordinates(el);
      el._mainTransform.setLocalPosition(new Float32Array([positionX, positionY, positionZ]));

      /* Reset hover effect properties set on setHoverState module.*/
      resetOriginalSizePosition(el);
    }
  };

  /**
   * Add MutationObserver to detect changes on position and visibility of HTML custom element via CSS class or style.
   * Re-position node when HTML custom element size/position changes via style attribute or css class.
   * Show/Hide node when HTML custom elelemt visibility changes via CSS.
   * @param {HTMLElement} el HTML custom element.
   */
  let setMutationObserver = (el) => {
    if (el._mutationObserver === undefined) {
      el._mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {

          /**
           * Get node. Either model or quad.
           */
          let node = (mutation.target._model ? mutation.target._model : mutation.target._quad);

          if (node) {
            /**
             * Hide node when css visibility hidden and node is visible and there is no visibility attribute in HTML custom element.
             */
            if (!isElementVisible(el) && node.visible && !el.hasAttribute('visibility')) {
              node.visible = false;
            }
            /**
             * Show node when css visibility is visible and node is hidden and there is no visibility attribute in HTML custom element.
             */
            else if (isElementVisible(el) && !node.visible && !el.hasAttribute('visibility')) {
              node.visible = true;
            }

            /**
             * Update and possition
             */
            setNodePosition(mutation.target);
          }
        });
      });

      let observerConfig = {
        attributeOldValue: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      };

      el._mutationObserver.observe(el, observerConfig);
    }
  };

  /**
   * Remove MutationObserver used to detect changes on position and visibility of HTML custom element.
   */
  let unsetMutationObserver = (el) => {
    if (el._mutationObserver) {
      el._mutationObserver.disconnect();
      delete el._mutationObserver;
    }
  };

  /**
   * When width and height size of the node is not specified via css, set the size of HTML custom element.
   * @param {HTMLElement} el HTML custom element.
   */
  let doAutoSize = (el) => {
    if (isElementVisible(el) && (el.clientWidth === 0 || el.clientHeight === 0)) {

      /**
       * Stop observing HTML element.
       */
      unsetMutationObserver(el);

      /**
       * No width specified via css.
       * Use clientHeight if available, otherwise use inherit, auto or parent's width.
       */
      if (el.clientWidth === 0) {
        if (el.clientHeight > 0) {
          el.style.width = `${el.clientHeight}px`;
        }
        else {
          el.style.width = `inherit`;
        }

        if (el.clientWidth === 0) {
          el.style.width = `auto`;
        }

        if (el.clientWidth === 0) {
          el.style.width = `${el.parentElement.clientWidth}px`;
        }
      }

      /**
       * No height specified via css.
       * Use inherit, auto or otherwise use clientWidth.
       */
      if (el.clientHeight === 0) {
        el.style.height = `inherit`;

        if (el.clientHeight === 0) {
          el.style.height = `auto`;
        }

        if (el.clientHeight === 0) {
          if (el.clientWidth > 0) {
            el.style.height = `${el.clientWidth}px`;
          }
        }
      }

      /**
       * Start observing the element again.
       */
      setMutationObserver(el);
    }

  };

  /**
   * Scale node size to match HTML custom element.
   * @param {HTMLElement} el HTML custom element.
   */
  let setNodeSize = (el) => {
    /**
     * Get node. Either model or quad.
     */
    let node = (el._model ? el._model : el._quad);

    if (node) {
      /**
       * Set HTML element's dimensions if they were not specified via css.
       * When no width is specified, use clientHeight if available, otherwise use inherit, auto or parent's width.
       * When no height is specified, use inherit, auto or otherwise use clientWidth.
       */
      if (el.clientWidth === 0 || el.clientHeight === 0 ) {
        doAutoSize(el);
      }

      /**
       * Get the size of HTML custom element.
       */
      let { width, height, breadth } = getHTMLElementSize(el);

      /**
       * Throw error if any of the node's dimensions has not been specified.
       */
      if (width === 0 || height === 0 || breadth === 0) {
        console.warn(`At least one of the node\'s dimension is not specified.  Dimensions are specified using CSS width/height properties: ${el.id}.`);
      }
      else {
        /**
         * Model.
         */
        if (el._model) {
          if (el.hasAttribute("fill") && (el.getAttribute('fill') === '' || el.getAttribute('fill') === 'true')) {
            el._model.setLocalScale(new Float32Array([width / el._resource.width, height / el._resource.height, breadth / el._resource.depth]));
          }
          /* Uniformly scale */
          else {
            /**
             * User didn't specifed breadth: Do scale based on width and height
             */
            let scaleRatio;
            if (!el.breadth) {
              scaleRatio = Math.min(width / el._resource.width, height / el._resource.height);
            }
            else {
              scaleRatio = Math.min(width / el._resource.width, height / el._resource.height, breadth / el._resource.depth);
            }

            /* Set local scale on the model. */
            el._model.setLocalScale(new Float32Array([scaleRatio, scaleRatio, scaleRatio]));

            /* Set Anchor position. */
            el._model.setAnchorPosition(new Float32Array([el._resource.center.x, el._resource.center.y, el._resource.center.z]));
          }
        }
        /**
         * Quad.
         */
        else if (el._quad) {
          el._quad.setLocalScale(new Float32Array([width, height, 0]));
          el._quad.setLocalPosition(new Float32Array([-((width) / 2), -(height / 2), 0]));
        }
      }
    }
  };

  /**
   * Parse and validate environment lighting attribute values.
   * Returns JSON Object with the  environment lighting properties.
   * @param {string} lightingString Environment lighting attribute value.
   * @returns {JSONObject} Properties for environment lighting.
   */
  let parseEnvironmentLighting = (lightingString) => {
    let environmentLighting = {};
    lightingString.split(/;/).forEach(parameter => {
      /**
       * Each attribute value has property name and value (name:value).
       */
      let parameterArr = parameter.split(':');

      /**
       * Expects name and value.
       */
      if (parameterArr.length === 2) {
        environmentLighting[parameterArr[0].trim()] = parameterArr[1].trim();
      }
    });

    /**
     * Validate Environment Lighting object.
     */
    if (environmentLighting['color-intensity'] || environmentLighting['bloom-strength']) {
      return environmentLighting;
    } else {
      console.error('Invalid values used for environment lighting attribute. Make sure to specify color-intensity or bloom-strength.');
    }
  };

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
    let volume = mlWorld[0];

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
        setScale(el, elemAttributes['model-scale']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set model scale.
       */
      if (elemAttributes['scale']) {
        setScale(el, elemAttributes['scale']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set model rotation.
       */
      if (elemAttributes.rotation) {
        setRotation(el, elemAttributes.rotation);
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
        setSpin(el, elemAttributes.spin);
      }

      /**
       * Set model scale to.
       */
      if (elemAttributes['scale-to']) {
        setScaleTo(el, elemAttributes['scale-to']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set model scale by.
       */
      if (elemAttributes['scale-by']) {
        setScaleBy(el, elemAttributes['scale-by']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set model move to.
       */
      if (elemAttributes['move-to']) {
        setMoveTo(el, elemAttributes['move-to']);
      }

      /**
       * Set model move by.
       */
      if (elemAttributes['move-by']) {
        setMoveBy(el, elemAttributes['move-by']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set model rotate to.
       */
      if (elemAttributes['rotate-to-angles']) {
        setRotateToAngles(el, elemAttributes['rotate-to-angles']);
      }

      /**
       * Set model rotate by.
       */
      if (elemAttributes['rotate-by-angles']) {
        setRotateByAngles(el, elemAttributes['rotate-by-angles']);
      }

      /**
       * New breadth or z-offset attribute value.
       * Set node size and position.
       */
      if (elemAttributes['breadth'] || elemAttributes['z-offset']) {
        setNodeSize(el);
        setNodePosition(el);
      }
    }
  };

  /**
   * Creates a Model.
   * @param {HTMLElement} el HTML custom element.
   * @param {JSONObject} resources Created by loadResource and contains model resource and shader type.
   */
  let createModel = (el, resources) => {

    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Create Model.
     */
    if (!el._model) {
      el._model = volume.createModel();

      /**
       * Make node hidden initially.
       */
      el._model.visible = false;

      /**
       * Add reference to HTML Custom Element.
       */
      el._model.htmlElement = el;
    }

    /**
     * Set triggerable so volume doesn't go into placement mode when longpress trigger.
     */
    el._model.triggerable = true;

    /**
     * Add reference to resource.
     */
    el._resource = resources.resource;

    /**
     * Add resource to model.
     */
    el._model.setModelResource(el._resource);

    /**
     * After setModelResource, check for dimensions in MLModelResource to validate resource.
     */
    if (isNaN(parseFloat(el._resource.width)) || !isFinite(el._resource.width)) {
      throw new Error(`Set model resource failed: ${el.src}`);
    }

    /**
     * Once the mesh is loaded, dispatch resource-loaded synthetic event.
     */
    el.dispatchEvent(new Event('resource-loaded'));

    /**
     * Set shader.
     * Use Pbr shader when glb file. Otherwise shader is UnlitTextured.
     */
    el._model.shader = resources.shader;

     /**
      * Create transform if it does not exists.
      * Add model to transform, add transform to volume.
      */
     if (!el._transform) {
       /**
        * _transform is used for transform animations.
        */
       el._transform = volume.createTransform();
       /**
        * Add reference to HTML Custom Element.
        */
       el._transform.htmlElement = el;

       el._transform.addChild(el._model);

       /**
        * _mainTransform is used for size and position.
        */
       el._mainTransform = volume.createTransform();
       el._mainTransform.addChild(el._transform);

       volume.addChild(el._mainTransform);
     }

    /**
     * Create reference to textures and kmat.
     * This is required for garbage collection.
     */
    if (el._kmat && el._textures) {
      el._model.textures = el._textures;
      el._model.kmat = el._kmat;
    }

    /**
     * Set model size.
     * Set model anchor position to center.
     */
    setNodeSize(el);

    /**
     * Set node position.
     * Position the node over top of its DOM Element.
     */
    setNodePosition(el);

    /**
     * Read all available attributes from element.
     */
    let elemAttributes = {
      trigger: el.getAttribute('trigger'),
      color: el.getAttribute('color'),
      raycast: el.getAttribute('raycast'),
      'model-scale': el.getAttribute('model-scale'),
      'scale': el.getAttribute('scale'),
      rotation: el.getAttribute('rotation'),
      'rotate-to-angles': el.getAttribute('rotate-to-angles'),
      'rotate-by-angles': el.getAttribute('rotate-by-angles'),
      'model-animation': el.getAttribute('model-animation'),
      spin: el.getAttribute('spin'),
      'scale-to': el.getAttribute('scale-to'),
      'scale-by': el.getAttribute('scale-by'),
      'move-to': el.getAttribute('move-to'),
      'move-by': el.getAttribute('move-by'),
      'environment-lighting': el.getAttribute('environment-lighting')
    };

    /**
     * Assign all elements attributes to model.
     */
    setModelAttributes(el, elemAttributes);

    /**
     * Call update after setting attributes.
     */
    window.mlWorld.update();

    /**
     * Once the everything is set, dispatch node-displayed synthetic event.
     */
    el.dispatchEvent(new Event('model-displayed'));

  };

  /**
   * Render the model node.
   * @param {HTMLElement} el HTML custom element.
   */
  let doModelRendering = async (el) => {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Materials attribute has kmat and textures.
     * Parse and validate materials.
     */
    if (el.hasAttribute('materials')) {
      let materials = parseMaterials(el.getAttribute('materials'));

      if (materials) {
        /**
         * Create textures, read textures array returned.
         */
        el._textures = await createTextures(materials.textures);

        /**
         * Create KMat, read KMat returned.
         */
        el._kmat = await createKMat(materials.kmat);

        /**
         * Add texture resources to kmat.
         */
        el._textures.forEach(texture => {
          el._kmat.addDependentResource(texture);
        });
      }
    }

    /**
     * Dispatch synthetic event mesh-readytoload.
     */
    el.dispatchEvent(new Event('mesh-readytoload'));

    /**
     * Get the model's resources.
     */
    let resources = await loadResource(el, el.getAttribute('src'));

    return createModel(el, resources);
   };

  /**
   * Create an instance of a model.
   * @param {HTMLElement} el HTML custom element.
   * @param {HTMLElement} elInstance HTML custom element. to create instance from.
   */
  let doModelInstance = (el, elInstance) => {
    /**
     * Get resources from elInsitance to create model.
     */
    let resources = {resource: elInstance._resource, shader: elInstance._model.shader};
    createModel(el, resources);
  };

  /**
   * Make nodes scrollable.
   * Add window scroll event listener to scroll node together with the HTML Custom element.
   * @param {HTMLElement} el HTML custom element.
   */
  let setScrollable = (el) => {
    if (el._scrollListener === undefined) {
      /**
       * Bind to current element.
       */
      el._scrollListener = handleScrolling.bind(el);
      window.addEventListener('scroll', el._scrollListener);
    }
  };

  /**
   * Remove window scroll event listener used to scroll node together.
   * @param {HTMLElement} el HTML custom element.
   */
  let unsetScrollable = (el) => {
    if (el._scrollListener) {
      window.removeEventListener('scroll', el._scrollListener);
      delete el._scrollListener;
    }
  };

  /**
   * Window scroll handler. Set node position when scrolling.
   */
  function handleScrolling() {
    /**
     * Set node position when scrolling.
     */
    setNodePosition(this);
  }

  /**
   * Add ResizeObserver to detect change in size of the HTML Custom element.
   * Re-size node when HTML custom element size changes.
   * @param {HTMLElement} el HTML custom element.
   */
  let setResizeObserver = (el) => {
    if (el._resizeObserver === undefined) {
      el._resizeObserver = new ResizeObserver( resizes => {
        resizes.forEach(resize => {
          /**
           * Update size and possition
           */
          setNodeSize(resize.target);
        });
      });

      el._resizeObserver.observe(el);
    }
  };

  /**
   * Add window resize event listener to set node position.
   * @param {HTMLElement} el HTML custom element.
   */
  let setResizeListener = (el) => {
    if (el._resizeListener === undefined) {
      /**
       * Bind to current element.
       */
      el._resizeListener = handleResize.bind(el);
      window.addEventListener('resize', el._resizeListener);
    }
  };

  /**
   * Remove window resize event listener.
   * @param {HTMLElement} el HTML custom element.
   */
  let unsetResizeListener = (el) => {
    if (el._resizeListener) {
      window.removeEventListener('resize', el._resizeListener);
      delete el._resizeListener;
    }
  };

  /**
   * Window resize handler. Set node position when window resize.
   */
  function handleResize() {
    /**
     * Set position node when window is resized.
     */
    setNodePosition(this);
  }

  /**
   * Add mlstage event listener to detect when stage size changes to set node position.
   * Re-position node when Stage changes.
   * @param {HTMLElement} el HTML custom element.
   */
  let setStageChangeListener = (el) => {
    if (el._stageChangeListener === undefined) {
      /**
       * Bind to current element.
       */
      el._stageChangeListener = handleStageChange.bind(el);
      document.addEventListener('mlstage', el._stageChangeListener);
    }
  };

  /**
   * Remove mlstage event listener used to detect when stage size changes.
   * @param {HTMLElement} el HTML custom element.
   */
  let unsetStageChangeListener = (el) => {
    if (el._stageChangeListener) {
      document.removeEventListener('mlstage', el._stageChangeListener);
      delete el._stageChangeListener;
    }
  };

  /**
   * Stage resize handler. Set node position when stage is resize.
   */
  function handleStageChange() {
    /**
     * Set position node when Stage is change.
     */
    setNodePosition(this);
  }

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
    if (node.visible && node.color.charAt(0) !== '#')  {
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

  /**
   * @function wiggle
   * @summary Wiggle effect on a node. Use transform rotateBy.
   */
  let wiggle = (el, axes = [0, 1, 0]) => {
    /**
     * Check transform exists.
     */
    if (!el._transform) return;

    /**
     * Wiggle
     */
    el._transform.rotateBy(new Float32Array(axes), 0.07, 0.1, 0);
    el._transform.rotateBy(new Float32Array(axes), -0.07, 0.1, 0);
    el._transform.rotateBy(new Float32Array(axes), -0.07, 0.1, 0);
    el._transform.rotateBy(new Float32Array(axes), 0.07, 0.1, 0);
  };

  /**
   * <ml-model> HTML Custom Element.
   */
  class MlModel extends HTMLElement {

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
              'scale',
              'scale-to',
              'scale-by',
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
        mlWorld[0].removeChild(this._mainTransform);
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

    /**
     * environmentLighting: Element's Property.
     */
    get environmentLighting() {
      return this.getAttribute('environment-lighting');
    }
    set environmentLighting(v) {
      this.setAttribute('environment-lighting', v);
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

    /**
     * Stop model animation.
     */
    stopModelAnimation() {
      if (this._model) {
        this._model.paused = true;
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
  }
  window.customElements.define('ml-model', MlModel);

  /**
   * Create quad texture with the quad path.
   * Only JPG and PNG are supported at the moment.
   * Returns the texture.
   * @param {string} texturePath Path to image file for quad.
   * @returns {Promise} Promise object represents the texture.
   */
  let createQuadTexture = (texturePath) => {
    /**
     * Check valid file extension OR valid base64 encoded image type.
     * Only JPG and PNG are supported.
     */
    let quadValidExtRe = new RegExp(/(\.(jpg|jpeg|png)(\?|#|$))|^(data:image\/(jpg|jpeg|png);base64,*)/i);

    if (!quadValidExtRe.test(texturePath)) {
      let quadTypeError = new Error(`Invalid quad image file type: ${texturePath}. Only JPG and PNG are supported at the moment for quads.`);
      return Promise.reject(quadTypeError);
    }

    /**
     * Create HTML image element with texture path.
     * Create texture using HTML image element.
     */
    return new Promise((resolve, reject) => {
      let img = new Image();

      img.onload = () => {

        /**
         * Create texture from JS Volume.
         */
        let texture = mlWorld[0].createTexture(img);

        /**
         * Check texture.
         */
        if (texture) {
          resolve(texture);
        } else {
          reject(new Error(`Problem loading quad texture: ${texturePath}.`));
        }
      };

      img.onerror = () => {
        reject(new Error(`Problem loading quad texture: ${texturePath}.`));
      };

      img.src = texturePath;
    });
  };

  /**
   * Set attributes: extractable, color, environment lighting, raycast, visibility, scale,
   * rotation, spin, scaleTo, scaleBy, moveTo, moveBy, rotateToAngles, rotateByAngles, breadth, z-offset.
   * @param {HTMLElement} el HTML custom element.
   * @param {JSONObject} elemAttributes Attribute name and value to be set.
   */
  let setQuadAttributes = (el, elemAttributes) => {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Get the quad.
     */
    let quad = el._quad;

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
     * Set quad-specific attributes.
     */
    if (quad) {
      /**
       * Set quad color.
       */
      if (elemAttributes.color) {
        quad.color = elemAttributes.color;
      }
      /**
       * Color value is blank. Reset quad color.
       */
      else if (elemAttributes.color === '') {
        let isPNG = new RegExp(/(\.png(\?|#|$))|^(data:image\/png;base64,*)/i);
        if (isPNG.test(el.src)) {
          quad.color = "rgba(255, 255, 255, 0.99)";
        }
        else {
          quad.color = "#FFFFFF";
        }
      }

      /**
       * Check for environment lighting and apply attributes if available.
       */
      if (elemAttributes['environment-lighting']) {
        let environmentLighting = parseEnvironmentLighting(elemAttributes['environment-lighting']);

        if (environmentLighting['color-intensity']) {
          quad.colorIntensity = environmentLighting['color-intensity'];
        }

        if (environmentLighting['bloom-strength']) {
          quad.bloomStrength = environmentLighting['bloom-strength'];
          volume.bloomStrength = environmentLighting['bloom-strength'];
        }
      }

      /**
       * Set skipRaycast.
       */
      if (elemAttributes.raycast) {
        setSkipRaycast(quad, !(elemAttributes.raycast === 'true'));
      }

      /**
       * Set node visibility.
       */
      if (elemAttributes.visibility) {
        quad.visible = isElementVisible(el) && !(elemAttributes.visibility === 'hidden');
      }

      /**
       * Set quad scale.
       */
      if (elemAttributes['quad-scale']) {
        setScale(el, elemAttributes['quad-scale']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set quad scale.
       */
      if (elemAttributes['scale']) {
        setScale(el, elemAttributes['scale']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set quad rotation.
       */
      if (elemAttributes.rotation) {
        setRotation(el, elemAttributes.rotation);
      }

      /**
       * Set quad spin.
       */
      if (elemAttributes.spin) {
        setSpin(el, elemAttributes.spin);
      }

      /**
       * Set quad scale to.
       */
      if (elemAttributes['scale-to']) {
        setScaleTo(el, elemAttributes['scale-to']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set quad scale by.
       */
      if (elemAttributes['scale-by']) {
        setScaleBy(el, elemAttributes['scale-by']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }


      /**
       * Set quad move to.
       */
      if (elemAttributes['move-to']) {
        setMoveTo(el, elemAttributes['move-to']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set quad move by.
       */
      if (elemAttributes['move-by']) {
        setMoveBy(el, elemAttributes['move-by']);

        /* Reset hover effect properties set on setHoverState module.*/
        resetOriginalSizePosition(el);
      }

      /**
       * Set quad rotate to.
       */
      if (elemAttributes['rotate-to-angles']) {
        setRotateToAngles(el, elemAttributes['rotate-to-angles']);
      }

      /**
       * Set quad rotate by.
       */
      if (elemAttributes['rotate-by-angles']) {
        setRotateByAngles(el, elemAttributes['rotate-by-angles']);
      }

      /**
       * New breadth or z-offset attribute value.
       * Set volume and quad size and position.
       */
      if (elemAttributes['breadth'] || elemAttributes['z-offset']) {
        setNodeSize(el);
        setNodePosition(el);
      }
    }
  };

  /**
   * Creates a Quad.
   * @param {HTMLElement} el HTML custom element.
   * @param {texture} texture Created by createQuadTexture.
   */
  let createQuad = (el, texture) => {
    /**
     * Get the volume.
     */
    let volume = mlWorld[0];

    /**
     * Create Quad.
     */
    if (!el._quad) {
      el._quad = volume.createQuad();

      /**
       * Make node hidden initially.
       */
      el._quad.visible = false;

      /**
       * Add reference to HTML Custom Element.
       */
      el._quad.htmlElement = el;
    }

    /**
     * Set triggerable so volume doesn't go into placement mode when longpress trigger.
     */
    el._quad.triggerable = true;

    /**
     * Add image texture to quad.
     */
    el._quad.setRenderResource(texture);

    /**
     * Set default transparent color when PNG.
     */
    let isPNG = new RegExp(/(\.png(\?|#|$))|^(data:image\/png;base64,*)/i);
    if (isPNG.test(el.src)) {
      el._quad.color = "rgba(255, 255, 255, 0.99)";
    }

    /**
     * Once the mesh is loaded, dispatch resource-loaded synthetic event.
     */
    el.dispatchEvent(new Event('resource-loaded'));

    /**
     * Create transform if it does not exists.
     * Add model to transform, add transform to volume.
     */
    if (!el._transform) {
      el._transform = volume.createTransform();
      /**
       * Add reference to HTML Custom Element.
       */
      el._transform.htmlElement = el;

      el._transform.addChild(el._quad);

      el._mainTransform = volume.createTransform();
      el._mainTransform.addChild(el._transform);

      volume.addChild(el._mainTransform);
    }

    /**
     * Set quad size.
     * Set quad anchor position to center.
     */
    setNodeSize(el);

    /**
     * Set node position.
     * Position the node over top of its DOM Element.
     */
    setNodePosition(el);

    /**
     * Read all available attributes from element.
     */
    let elemAttributes = {
      trigger: el.getAttribute('trigger'),
      color: el.getAttribute('color'),
      raycast: el.getAttribute('raycast'),
      'quad-scale': el.getAttribute('quad-scale'),
      'scale': el.getAttribute('scale'),
      rotation: el.getAttribute('rotation'),
      'rotate-to-angles': el.getAttribute('rotate-to-angles'),
      'rotate-by-angles': el.getAttribute('rotate-by-angles'),
      spin: el.getAttribute('spin'),
      'scale-to': el.getAttribute('scale-to'),
      'scale-by': el.getAttribute('scale-by'),
      'move-to': el.getAttribute('move-to'),
      'move-by': el.getAttribute('move-by'),
      'environment-lighting': el.getAttribute('environment-lighting')
    };

    /**
     * Assign all elements attributes to quad.
     */
    setQuadAttributes(el, elemAttributes);

    /**
     * Call update after setting attributes.
     */
    window.mlWorld.update();

    /**
     * Once the quad is loaded, dispatch resource-loaded synthetic event.
     */
    el.dispatchEvent(new Event('quad-displayed'));
  };

  /**
    * Render the quad node.
    * @param {HTMLElement} el HTML custom element.
    */
  let doQuadRendering = async (el) => {
    /**
     * Create texture for quad.
     * Keep reference to texture.
     */
    el._texture = await createQuadTexture(el.getAttribute('src'));

    /**
     * Dispatch synthetic event quad-readytoload.
     */
    el.dispatchEvent(new Event('quad-readytoload'));

    /**
     * create the quad.
     */
    return createQuad(el, el._texture);
  };

  /**
    * Create an instance of a quad.
    * @param {HTMLElement} el HTML custom element.
    * @param {HTMLElement} elInstance HTML custom element. to create instance from.
    */
  let doQuadInstance = (el, elInstance) => {
    /**
     * Get texture from elInsitance to create quad.
     */
    createQuad(el, elInstance._texture);
  };

  /**
   * <ml-quad> HTML Custom Element.
   */
  class MlQuad extends HTMLElement {

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
      if (this.src) {
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
        this.doRendering().then(() => {
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
     * An alias of doQuadRendering.
     */
    doRendering() {
      return doQuadRendering(this);
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
      else if (mlWorld[0] && this._quad) {
       setQuadAttributes(this, {[name] : newValue});
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
      if (this._quad) {
        this._transform.removeChild(this._quad);
        this._mainTransform.removeChild(this._transform);
        mlWorld[0].removeChild(this._mainTransform);
      }

      this._quad = null;
      this._texture = null;
      this._mainTransform = null;
      this._transform = null;

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
  }
  window.customElements.define('ml-quad', MlQuad);

  /**
   * Handler when Stage changes or page is rotated.
   * Set new position, size and rotation of JS volume.
   */
  let mainStageChangedListener = () => {
    if (mlWorld.length > 0) {
      /**
       * Get the volume.
       */
      let volume = mlWorld[0];

      /**
       * Set new position and rotation of JS volume.
       */
      let transformMatrix = new DOMMatrix();
      let orientation = window.mlWorld.orientation;

      if (orientation === "flat") {
        transformMatrix = transformMatrix.translate((window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, window.mlWorld.viewPortPositionTopLeft.y + (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2, (window.mlWorld.stageExtent.bottom - window.mlWorld.stageExtent.top)/2);
        transformMatrix = transformMatrix.rotateAxisAngle(1, 0, 0, -90);
      }
      else {
        const viewPortPositionTopLeftY = window.mlWorld.viewportHeight/2 + window.mlWorld.viewPortPositionTopLeft.y;
        transformMatrix = transformMatrix.translate((window.mlWorld.stageExtent.right - window.mlWorld.stageExtent.left)/2, viewPortPositionTopLeftY + (window.mlWorld.stageExtent.top - window.mlWorld.stageExtent.bottom)/2, (window.mlWorld.stageExtent.front - window.mlWorld.stageExtent.back)/2);
        transformMatrix = transformMatrix.rotateAxisAngle(1, 0, 0, 0);
      }

      /**
       * Apply tranformMatrix to JS volume.
       */
      volume.transformVolumeRelativeToHostVolume(transformMatrix);

      /**
       * Set new size JS volume.
       */
      volume.setSize(window.mlWorld.stageSize.x, window.mlWorld.stageSize.y, window.mlWorld.stageSize.z);
    }
  };

  /*!
   * @license
   * Copyright (c) 2018-present Magic Leap, Inc. All Rights Reserved.
   * Distributed under Apache 2.0 License. See LICENSE file in the project root directory for full license information.
   */

  /**
   * Helio ® mixed-reality browser detected.
   */
  if (window.mlWorld) {
    /**
     * Listen for stage resize event to reposition and resize the JS Volume.
     */
    document.addEventListener('mlstage', mainStageChangedListener);

    /**
     * Listen for page orientation event to rotate and reposition the JS Volume.
     */
    document.addEventListener("mlpageorientation", mainStageChangedListener);

    /**
     * Animate at 60FPS by calling mlWorld.update();
     */
    setInterval (() => window.mlWorld.update(), 16);
  }
  else {
    console.warn("Unable to render content: No mixed-reality browser detected.");
  }

  exports.MlModel = MlModel;
  exports.MlQuad = MlQuad;
  exports.MlStage = MlStage;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=prismatic.js.map
