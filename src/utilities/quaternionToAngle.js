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
}

export { quaternionToAngle }
