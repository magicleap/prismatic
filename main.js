/*!
 * @license
 * Copyright (c) 2019 Magic Leap, Inc. All Rights Reserved.
 * You may use this file to develop and test websites that are compatible with
 * Magic Leap’s mixed reality technology platform (including Magic Leap’s mixed
 * reality hardware device(s) manufactured by or on behalf of Magic Leap and
 * Magic Leap’s operating systems), and distribute this file as incorporated
 * into those websites.  You may not modify this file, or use this file to
 * directly or indirectly develop websites that are incompatible Magic Leap’s
 * mixed reality technology platform.
 *
 * TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MAGIC LEAP IS PROVIDING
 * THIS FILE ON AN “AS-IS” BASIS FOR USE AT YOUR OWN RISK. MAGIC LEAP DISCLAIMS
 * ALL WARRANTIES WITH RESPECT TO THIS FILE, WHETHER EXPRESS OR IMPLIED, OR
 * STATUTORY, INCLUDING, WITHOUT LIMITATION, ANY WARRANTIES OF NON-INFRINGEMENT
 * OF THIRD-PARTY RIGHTS, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
 * QUIET ENJOYMENT, NON-INTERFERENCE, SYSTEM INTEGRATION, OR ACCURACY.
 * MAGIC LEAP DOES NOT WARRANT THAT YOUR USE OF THIS FILE WILL BE UNINTERRUPTED
 * ERROR-FREE, VIRUS-FREE, OR SECURE.
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
   * Reset stage.
   */
  window.mlWorld.resetStageExtension();

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

/**
 * Dispatch mlstage event to reposition the JS volume in case the window.mlWorld.viewPortPositionTopLeft.y was updated.
 */
window.addEventListener('load', (event) => {
  let mlstageEvent = new Event('mlstage');
  document.dispatchEvent(mlstageEvent);
});


export {
  MlStage,
  MlModel,
  MlQuad
};
