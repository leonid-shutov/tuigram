/** @type {Record<string, string>} */
const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'audio/x-opus': 'ogg',
  'audio/mpeg': 'mp3',
  'text/plain': 'txt',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-tgsticker': 'tgs',
};

/** @type {typeof Media.extension} */
(mimeType) => {
  const base = mimeType.split(';')[0].trim().toLowerCase();
  if (EXTENSIONS[base] !== undefined) return EXTENSIONS[base];
  const subtype = base.split('/')[1];
  return subtype !== undefined && /^[a-z0-9]+$/.test(subtype) ? subtype : 'bin';
};
