// Runs at start, in the background: thumbnails begin loading only after sign-in and a history
// fetch, so the prune is normally done before the first hit could race it.
const DIRS = ['thumbs', 'media'];

/** @type {Actions['pruneCache']} */
async () => {
  let pruned = 0;
  for (const dir of DIRS) {
    const path = node.path.join(config.paths.cache, dir);
    pruned += await Cache.prune(path, config.cache.maxAgeMs).catch(() => 0);
  }
  if (pruned > 0) console.log(`[cache] pruned ${pruned} files`);
};
