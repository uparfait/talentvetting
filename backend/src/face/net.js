/* face/net.js: the three nets (tiny face detector, 68 point landmarks, face recognition) loaded once per instance from
   config.face.models_dir. A failed load is forgotten so the next call tries again. */
const config = require('../config');
const { faceapi, init_backend } = require('./backend');

let loading = null;

function load_nets() {
  if (!loading) loading = (async () => {
    await init_backend();
    const dir = config.face.models_dir;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromDisk(dir),
      faceapi.nets.faceLandmark68Net.loadFromDisk(dir),
      faceapi.nets.faceRecognitionNet.loadFromDisk(dir)
    ]);
    return faceapi.nets;
  })().catch(err => { loading = null; throw err; });
  return loading;
}

module.exports = { load_nets };
