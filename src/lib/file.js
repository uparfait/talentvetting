/* lib/file.js: read_file(file) -> { name, type, data }: a chosen file read in the browser, its content as base64, the
   shape the API takes for a degree document (the server checks its type and size). */
export const read_file = file => new Promise((ok, no) => {
  const r = new FileReader();
  r.onload = () => ok({ name: file.name, type: file.type || 'application/octet-stream', data: String(r.result).split(',')[1] || '' });
  r.onerror = () => no(Object.assign(new Error('The file could not be read. Choose it again.'), { level: 'warning' }));
  r.readAsDataURL(file);
});
/* picture_url(file): a chosen picture as a jpeg data URL at most 1024 px on its longest side, the size the server takes
   for a profile photo (it finds the face and cuts the photo itself) */
export async function picture_url(file, max = 1024) {
  let img; try { img = await createImageBitmap(file); } catch { throw Object.assign(new Error('This picture could not be read. Choose a JPEG or PNG.'), { level: 'warning' }); }
  const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); img.close?.();
  return c.toDataURL('image/jpeg', 0.9);
}
