// Shared by downloadThumb and openMedia: both just need these bytes sitting at `path`,
// written atomically so a reader never sees a partial file. Checking whether they're already
// there, and what producing them when they aren't actually means, is each caller's own business.
/** @type {typeof Cache.write} */
async (path, bytes) => {
  const part = `${path}.part`;
  await node.fs.promises.mkdir(node.path.dirname(path), { recursive: true });
  try {
    await node.fs.promises.writeFile(part, bytes);
    await node.fs.promises.rename(part, path);
  } catch (error) {
    await node.fs.promises.rm(part, { force: true });
    throw error;
  }
  return path;
};
