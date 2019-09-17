import { setNodePosition } from '../helpers/setNodePosition.js';

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
};

export { setStageChangeListener, unsetStageChangeListener}
