/* vision/liveness.js: is it a live face? (the Face project's technique) The person turns the head left, then right: the
   nose moves between the two ends of the jaw, which a printed photo cannot do. yaw(landmarks) is 0 (facing the camera)
   to about plus or minus 0.5; the picture is mirrored, so the person's left is the image's right. */
export function yaw(lm) {
  const j = lm.getJawOutline(), nose = lm.getNose()[3], l = j[0].x, r = j[16].x;
  return (nose.x - (l + r) / 2) / Math.max(1, r - l);
}
export const STEPS = [['left', 'Turn your head to the left', y => y > 0.12], ['right', 'Now turn to the right', y => y < -0.12], ['center', 'Look at the camera', y => Math.abs(y) < 0.06]];
