# Camera and screen

The browser only captures. Every face check runs on the server (`backend/src/face`).

## Frames (`src/vision/camera.js`)
`open_camera(video)` starts the front camera; the preview is mirrored by CSS only. `frame(video)` is a JPEG data URL
of the picture as the camera sees it (not mirrored), about 640 px wide, quality 0.8.

## Registration photo (`pages/auth/photo_capture.jsx`)
1. The camera starts; refusals and missing cameras get a clear message.
2. One frame at a time goes to `POST /vision/liveness` with the session the server gave back, about 400 ms after each
   reply. The reply has the step (left, right, front, done), a hint key and the words to show (`text`).
3. The person turns left and right (either order), then looks straight and holds still. When done, the server keeps
   the photo and its descriptor and returns a capture id; Create account sends it.

## Exams (`pages/exam`)
- Setup: `POST /vision/check` with one frame: one face, matching the profile photo. The whole screen shared: the
  browser says which surface was chosen (`displaySurface === 'monitor'`); a tab or a window is refused.
- While the test runs (`pages/exam/watch.js`): tab hidden, focus lost, full screen left and screen sharing stopped go
  to `POST /tests/:test/events`; a frame goes to `POST /tests/:test/frame` every 4 s and the server logs what it saw.
- The server writes the integrity report from the log when the test is submitted.

Exams need a computer: phones cannot share their whole screen.
