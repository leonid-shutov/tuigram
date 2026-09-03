/** @type {Map<string, Promise<Uint8Array | null>>} */
const cache = new Map();

/** @type {MessengerModule['downloadThumb']} */
(fileId) => {
  const cached = cache.get(fileId);
  if (cached !== undefined) return cached;
  const request = messenger.tg.downloadAsBuffer(fileId).catch(() => null);
  cache.set(fileId, request);
  return request;
};
