// install.sh installs straight from the npm registry, so the newest version is exactly what
// Source.npm resolves -- but it also brings the Node that version's `engines.node` asks for, so
// unlike a plain npm install the running Node has nothing to satisfy.
/** @type {typeof Source.script} */
async () => {
  const found = await Source.npm();
  return found === null ? null : { version: found.version, minNode: null };
};
