/* face/settings.js: every number and word the face pipeline uses, in one place (tuned in the Face project).
   pos is where the nose sits between the two ends of the jaw: 0.5 is straight ahead, above turn_left_at the person
   turned to their own left (on an unmirrored frame), below turn_right_at to their right. */
module.exports = {
  input_size: 192,
  check_input: 256,
  detect_width: 320,
  score_threshold: 0.35,
  min_score: 0.5,
  min_face_ratio: 0.2,
  max_face_ratio: 0.6,
  center_ratio: 0.7,
  dark_luma: 50,
  bright_luma: 225,
  turn_left_at: 0.62,
  turn_right_at: 0.38,
  front_range: 0.08,
  lost_face_ms: 2500,
  photo_size: 320,
  min_side: 32,
  max_side: 4096,
  max_bytes: 2 * 1024 * 1024,
  turns: ['left', 'right'],
  hints: {
    left: 'Turn your head to the left',
    right: 'Now turn your head to the right',
    front: 'Look straight at the camera',
    still: 'Hold still',
    done: 'Done',
    none: 'Look at the camera',
    dark: 'Too dark: find more light',
    bright: 'Too bright: move away from the light',
    closer: 'Move closer',
    back: 'Move back a little',
    middle: 'Move to the middle',
    others: 'Only you should be in view',
    mismatch: 'This face does not match the account',
    '': ''
  }
};
