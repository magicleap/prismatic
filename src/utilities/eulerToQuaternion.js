/**
 * @module utilities/eulerToQuaternion
 */
/**
 * Conversion Euler to Quaternion.
 * Returns array with rotation in quaternion.
 * @param {number[]} eulerArray rotation angle values in array.
 * @returns {number[]} Rotation in quaternion.
 */
let eulerToQuaternion = (eulerArray) => {
	/* ZYX arbitrary rotation order */
	let c1 = Math.cos(eulerArray[0] / 2),
      c2 = Math.cos(eulerArray[1] / 2),
      c3 = Math.cos(eulerArray[2] / 2),
      s1 = Math.sin(eulerArray[0] / 2),
      s2 = Math.sin(eulerArray[1] / 2),
      s3 = Math.sin(eulerArray[2] / 2),
			w = c1 * c2 * c3 + s1 * s2 * s3,
	    x = s1 * c2 * c3 - c1 * s2 * s3,
	    y = c1 * s2 * c3 + s1 * c2 * s3,
	    z = c1 * c2 * s3 - s1 * s2 * c3;

  return [x, y, z, w];
};

export { eulerToQuaternion }
