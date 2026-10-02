/** @type {Map<string, Promise<string | null>>} */
const cache = new Map();

/** @type {MessengerModule['downloadThumb']} */
(fileId) => {
  const cached = cache.get(fileId);
  if (cached !== undefined) return cached;
  const file = node.path.join(config.paths.cache, 'thumbs', fileId);
  const request = (async () => {
    if (node.fs.existsSync(file)) return file;
    const bytes = await messenger.tg.downloadAsBuffer(fileId).catch(() => null);
    if (bytes === null) return null;
    return Cache.write(file, bytes).catch(() => null);
  })();
  cache.set(fileId, request);
  return request;
};
