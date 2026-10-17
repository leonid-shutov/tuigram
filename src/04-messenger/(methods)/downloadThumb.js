/** @type {Map<string, Promise<string | null>>} */
const cache = new Map();

// Keyed by the stable id, not the file id: the same thumbnail turns up under fresh file ids, and
// each would otherwise be another download and another copy on disk.
/** @type {MessengerModule['downloadThumb']} */
(fileId, key) => {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const file = node.path.join(config.paths.cache, 'thumbs', key);
  const request = (async () => {
    if (node.fs.existsSync(file)) return file;
    const bytes = await messenger.tg.downloadAsBuffer(fileId).catch(() => null);
    if (bytes === null) return null;
    return Cache.write(file, bytes).catch(() => null);
  })();
  cache.set(key, request);
  return request;
};
