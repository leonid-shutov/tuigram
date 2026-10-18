// A cache hit, and the mark that keeps it from aging out: refreshes the file's mtime, which
// Cache.prune reads as its last use. Doubles as the existence check — a file that is gone
// (never written, or just pruned) fails the touch, and its caller downloads it again. Any other
// failure (a file we don't own, a read-only cache) only means the mark didn't take: setting
// explicit times needs ownership, not just access, so fall back to asking whether it's there.
/** @type {typeof Cache.touch} */
(path) => {
  const now = new Date();
  return node.fs.promises.utimes(path, now, now).then(
    () => true,
    (error) =>
      error.code === 'ENOENT'
        ? false
        : node.fs.promises.access(path).then(
            () => true,
            () => false,
          ),
  );
};
