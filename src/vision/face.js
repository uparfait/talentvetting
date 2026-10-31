/* vision/face.js: faces in the browser with face-api.js (MIT): the library from the CDN on first use, its models
   (Tiny Face Detector, Face Landmark 68, Face Recognition) from public/models. detect(src) gives how many faces, the
   main one's box, landmarks and 128 number descriptor; distance(a, b) under 0.5 means the same person. Where the
   library cannot load (offline), checks are simulated and say so (simulated: true). */
const LIB = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.15/dist/face-api.esm.js';
let api = null, loading = null;
export async function load() {
  if (api || loading) return loading || api;
  loading = import(/* @vite-ignore */ LIB).then(async f => { const m = `${import.meta.env.BASE_URL}models`;
    await Promise.all([f.nets.tinyFaceDetector.loadFromUri(m), f.nets.faceLandmark68Net.loadFromUri(m), f.nets.faceRecognitionNet.loadFromUri(m)]);
    api = f; return f; }).catch(() => (api = false));
  return loading;
}
export const simulated = () => api === false;
export async function detect(src) {
  const f = await load();
  if (!f) return { count: 1, simulated: true };
  const all = await f.detectAllFaces(src, new f.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })).withFaceLandmarks().withFaceDescriptors();
  const main = all.sort((a, b) => b.detection.box.area - a.detection.box.area)[0];
  return { count: all.length, box: main?.detection.box, landmarks: main?.landmarks, descriptor: main ? Array.from(main.descriptor) : null };
}
export const distance = (a, b) => a && b ? Math.sqrt(a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0)) : 0;
export const SAME = 0.5;
