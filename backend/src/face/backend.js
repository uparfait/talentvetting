/* face/backend.js: TensorFlow for the face nets. face-api's node-wasm build shares one tf with
   @tensorflow/tfjs-backend-wasm; the wasm binaries come from config.face.wasm_dir (deployed with the function), and the
   plain cpu backend takes over only if wasm cannot start. init_backend() runs once per instance. */
const config = require('../config');
const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');

const { tf } = faceapi;
let ready = null;

function init_backend() {
  if (!ready) ready = (async () => {
    try {
      const wasm = tf.setWasmPaths ? tf : require('@tensorflow/tfjs-backend-wasm');
      wasm.setWasmPaths(config.face.wasm_dir.replace(/\\/g, '/') + '/');
      await tf.setBackend('wasm');
    } catch (err) {
      console.warn('[face] wasm failed, using cpu:', String(err && err.message).split('\n')[0]);
      await tf.setBackend('cpu');
    }
    await tf.ready();
    tf.enableProdMode();
    return tf.getBackend();
  })().catch(err => { ready = null; throw err; });
  return ready;
}

module.exports = { faceapi, tf, init_backend };
