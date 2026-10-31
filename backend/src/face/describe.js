/* face/describe.js: the 128 numbers that tell one face from another, computed on the face cut out along its aligned
   landmarks from the full picture. */
const { faceapi } = require('./backend');
const { to_tensor } = require('./image');

async function describe(img, det) {
  const full = to_tensor(img.full);
  try {
    const [face] = await faceapi.extractFaceTensors(full, [det.aligned]);
    try {
      return Array.from(await faceapi.nets.faceRecognitionNet.computeFaceDescriptor(face));
    } finally {
      face.dispose();
    }
  } finally {
    full.dispose();
  }
}

module.exports = { describe };
