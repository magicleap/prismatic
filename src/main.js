/*!
 * @license
 * Copyright (c) 2018-present Magic Leap, Inc. All Rights Reserved.
 * Distributed under Apache 2.0 License. See LICENSE file in the project root directory for full license information.
 */

/* Modules */
import { MlStage } from './primitives/stage.js';
import { MlModel } from './primitives/model.js';
import { MlQuad }  from './primitives/quad.js';
import { mainStageChangedListener } from './helpers/mainStageChangedListener.js';

/**
 * Helio ® mixed-reality browser detected.
 */
if (window.mlWorld) {
  /**
   * Listen for stage resize event to reposition and resize the JS Volume.
   */
  document.addEventListener('mlstage', mainStageChangedListener);

  /**
   * Animate at 60FPS by calling mlWorld.update();
   */
  setInterval (() => window.mlWorld.update(), 16);

}
else {
  console.warn("Unable to render content: No mixed-reality browser detected.");
}

export {
  MlStage,
  MlModel,
  MlQuad
};
