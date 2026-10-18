// Deletes every file in `dir` whose mtime is older than `maxAgeMs`; a cache hit refreshes the
// mtime, so this is age since last use. The stat and the unlink run back to back, synchronously,
// so no JS runs between the check and the delete — but a touch's utimes runs on the threadpool
// and can still land in that gap, reporting a hit on a file that's about to go. Rare, since the
// prune runs at start, ahead of the first hits (see actions.pruneCache), not ruled out.
// A stray `.part` from an interrupted write ages out the same way.
const YIELD_EVERY = 200;

/** @type {typeof Cache.prune} */
async (dir, maxAgeMs) => {
  const listed = await Result.fromPromise(node.fs.promises.readdir(dir));
  if (!listed.ok) return 0;
  const cutoff = Date.now() - maxAgeMs;
  let pruned = 0;
  for (const [index, name] of listed.unwrap().entries()) {
    // Keep the UI responsive through a first prune of thousands of files.
    if (index > 0 && index % YIELD_EVERY === 0) await node.timers.promises.setImmediate();
    const file = node.path.join(dir, name);
    const removed = Result.from(() => {
      const stats = node.fs.statSync(file);
      if (!stats.isFile() || stats.mtimeMs >= cutoff) return false;
      node.fs.unlinkSync(file);
      return true;
    });
    if (removed.ok && removed.unwrap()) pruned += 1;
  }
  return pruned;
};
