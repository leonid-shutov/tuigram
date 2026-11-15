// .deb/.rpm bundles ship the private Node the release's `engines.node` asks for (the same
// recipe as install.sh), so whatever the running Node is, it already satisfies the release --
// like the AUR's system-Node dependency, there is nothing here to warn about. The version itself
// is exactly what Source.npm resolves: every system package is built from that same npm tarball.
/** @type {typeof Source.system} */
async () => {
  const found = await Source.npm();
  return found === null ? null : { version: found.version, minNode: null };
};
