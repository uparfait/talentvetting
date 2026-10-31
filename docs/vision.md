# Vision in the browser

No picture or video leaves the browser. Models run locally; only short text events reach the AI.

## Library and models
face-api.js (`@vladmandic/face-api`, MIT) loads from the CDN on the photo and exam screens only. Its models are in
`public/models` (from the Face project): Tiny Face Detector (190 KB), Face Landmark 68 (350 KB) and Face Recognition
(6.4 MB), cached for a month. If the library cannot load (offline), checks say they are simulated and a plain photo is
taken; the account records `face_check: 'simulated'`.

## Registration photo (`pages/auth/photo_capture.jsx`)
1. The front camera starts (`getUserMedia`); refusals and missing cameras get a clear message.
2. Liveness: turn left, turn right, look back. The nose moves between the jaw ends, which a printed photo cannot do
   (`vision/liveness.js`). Exactly one face must be in view.
3. A 320 px JPEG and the 128 number descriptor are kept with the account.

## Exams (`pages/exam`)
- Setup: camera on and the face matching the profile photo (euclidean distance under 0.5), the entire screen shared
  (`getDisplayMedia`; a tab or a window is refused), then full screen.
- Monitoring every 2 s (`vision/monitor.js`): no face, more than one face, a face unlike the profile photo; plus tab
  hidden, window focus lost, full screen left and screen sharing stopped.
- Each event is text with a time, e.g. "2 faces detected at 04:12". The ProctorReportAgent turns the log into a verdict.

## Production notes
- OCR of image documents: Tesseract.js in the browser; PDF text: unpdf in a function.
- MediaPipe Face Detection is a lighter alternative to the tiny detector on low end phones.
- Exams need a computer: phones cannot share their whole screen.
