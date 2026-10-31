/* vision/camera.js: the camera (getUserMedia) and the screen (getDisplayMedia). open_camera(video) starts the front camera
   into a <video> (the preview is mirrored by CSS only); frame(video) is a JPEG data URL of the picture as the camera sees
   it (not mirrored, about 640 px wide), the shape the server's face checks read; share_screen() asks for the whole
   screen and says whether the person chose it (a tab or a window is not enough for an exam). */
export const why = e => ({ NotAllowedError: 'Camera blocked. Allow it for this site, then try again.', NotFoundError: 'No camera found.',
  NotReadableError: 'Another app is using the camera.' }[e?.name] || 'The camera could not start.');

export async function open_camera(video) {
  const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false });
  video.srcObject = s; await video.play(); return s;
}
export const stop = s => s?.getTracks().forEach(t => t.stop());
export function frame(video, w = 640) {
  const c = document.createElement('canvas'), k = w / (video.videoWidth || w); c.width = w; c.height = Math.round((video.videoHeight || w * 0.75) * k);
  c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}
export async function share_screen() {
  const s = await navigator.mediaDevices.getDisplayMedia({ video: { displaySurface: 'monitor' }, audio: false });
  const surface = s.getVideoTracks()[0]?.getSettings().displaySurface;
  return { stream: s, whole: !surface || surface === 'monitor' };
}
