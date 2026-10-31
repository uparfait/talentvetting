/* face/pose.js: head pose from the 68 landmarks (the Face project's technique).
   pos: the nose tip's place between the two ends of the jaw, 0.5 is straight ahead.
   tilt: the nose's place between the eye line and the chin. face_box hugs the points, with room for the forehead. */
function head_pose(landmarks) {
  const jaw = landmarks.getJawOutline();
  const nose = landmarks.getNose()[3];
  const eyes = [...landmarks.getLeftEye(), ...landmarks.getRightEye()];
  const eye_y = eyes.reduce((sum, p) => sum + p.y, 0) / eyes.length;
  const pos = (nose.x - jaw[0].x) / ((jaw[16].x - jaw[0].x) || 1);
  const tilt = (nose.y - eye_y) / ((jaw[8].y - eye_y) || 1);
  return { pos, tilt };
}

function face_box(landmarks) {
  const pts = landmarks.positions;
  const xs = pts.map(p => p.x), ys = pts.map(p => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const mx = (x1 - x0) * 0.06, my = (y1 - y0) * 0.12;
  return { x: Math.round(x0 - mx), y: Math.round(y0 - my * 2), width: Math.round(x1 - x0 + mx * 2), height: Math.round(y1 - y0 + my * 3) };
}

/* did the face box jump too far to be the same person between two frames? */
function jumped(a, b) {
  if (!a || !b) return false;
  const moved = Math.hypot(a.x - b.x, a.y - b.y) > Math.max(a.width, b.width) * 0.8;
  const resized = b.width > a.width * 1.8 || b.width < a.width * 0.55;
  return moved || resized;
}

const still_enough = (a, b) => !!a && !!b && Math.hypot(a.x - b.x, a.y - b.y) <= b.width * 0.04;

module.exports = { head_pose, face_box, jumped, still_enough };
