/**
 * @module helpers/createKMat
 */

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


export { createKMat }
