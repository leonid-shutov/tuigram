// The AppImage bundles the private Node the release's `engines.node` asks for (the same recipe
// as install.sh), so the running Node always satisfies the release -- there is nothing here to
// warn about. The version is exactly what Source.npm resolves: every AppImage is built from that
// same npm tarball.
/** @type {typeof Source.appimage} */
async () => {
  const found = await Source.npm();
  return found === null ? null : { version: found.version, minNode: null };
};
