/**
 * @module utilities/displayWarning
 */
/**
 * Console out warning and add border to custom element.
 * @param {HTMLElement} el HTML custom element.
 * @param {msg} Message to be shown in console warning.
 */
let displayWarning = (el, msg) => {
  console.warn(msg);
  /**
   * Add a border and text to where the 3D content should be rendered.
   */
   el.style.border = "solid 2px #ffffff47";
   el.style.color = "#FFF";
   el.style.color = "#FFF";
   el.style.textTransform = "uppercase";
   el.style.letterSpacing = "2px";
   el.style.fontSize = "14px";
   el.style.padding = "2%";
   el.innerHTML = "MR Content";
}

export { displayWarning }
