/* scripts/models.js: puts the face models in backend/models so they deploy with the API (npm run models): the face
   detector, the 68 point landmarks and the face recognition net from @vladmandic/face-api, and tfjs's wasm binaries.
   Nothing is fetched from outside at run time. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..'), out = path.join(root, 'models'), wasm_out = path.join(out, 'wasm');
const nets = ['tiny_face_detector_model', 'face_landmark_68_model', 'face_recognition_model'];
const src = path.join(root, 'node_modules', '@vladmandic', 'face-api', 'model');
const wasm_src = path.join(root, 'node_modules', '@tensorflow', 'tfjs-backend-wasm', 'dist');

fs.mkdirSync(wasm_out, { recursive: true });
for (const n of nets) for (const end of ['-weights_manifest.json', '.bin']) fs.copyFileSync(path.join(src, n + end), path.join(out, n + end));
for (const f of fs.readdirSync(wasm_src).filter(x => x.endsWith('.wasm'))) fs.copyFileSync(path.join(wasm_src, f), path.join(wasm_out, f));
for (const f of [...fs.readdirSync(out), ...fs.readdirSync(wasm_out).map(x => `wasm/${x}`)].filter(x => x !== 'wasm'))
  console.log(f.padEnd(52), `${Math.round(fs.statSync(path.join(out, f)).size / 1024)} KB`);
