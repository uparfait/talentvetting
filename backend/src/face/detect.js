/* face/detect.js: detection runs on the small copy, landmarks on the full picture. Every face comes back with its box in
   full picture pixels (tightened to the landmarks), the detector score, the head pose and the aligned box for the
   descriptor. Tensors are always disposed. */
const { faceapi } = require('./backend');
const { load_nets } = require('./net');
const { to_tensor } = require('./image');
const { head_pose, face_box } = require('./pose');
const C = require('./settings');

async function find_boxes(img, input_size) {
  const small = to_tensor(img.small);
  try {
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: input_size, scoreThreshold: C.score_threshold });
    const dets = await faceapi.detectAllFaces(small, options);
    const s = img.scale;
    return dets.map(d => ({ score: d.score, rect: new faceapi.Rect(d.box.x * s, d.box.y * s, d.box.width * s, d.box.height * s) }));
  } finally {
    small.dispose();
  }
}

async function detect_faces(img, input_size = C.input_size) {
  await load_nets();
  const boxes = await find_boxes(img, input_size);
  if (!boxes.length) return [];
  const full = to_tensor(img.full);
  try {
    const faces = await faceapi.extractFaceTensors(full, boxes.map(b => b.rect));
    const out = [];
    for (let i = 0; i < faces.length; i++) {
      try {
        const local = await faceapi.nets.faceLandmark68Net.detectLandmarks(faces[i]);
        const marks = local.shiftBy(boxes[i].rect.x, boxes[i].rect.y);
        out.push({ box: face_box(marks), score: boxes[i].score, pose: head_pose(marks), aligned: marks.align() });
      } finally {
        faces[i].dispose();
      }
    }
    return out;
  } finally {
    full.dispose();
  }
}

const area = d => d.box.width * d.box.height;
const largest = dets => dets.reduce((a, b) => (area(a) >= area(b) ? a : b));

module.exports = { detect_faces, largest };
