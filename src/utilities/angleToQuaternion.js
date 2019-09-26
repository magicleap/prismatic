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

export { angleToQuaternion }
