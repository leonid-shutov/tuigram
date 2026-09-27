// mise's npm backend installs straight from the npm registry, so the newest version and its
// `engines.node` are exactly what Source.npm already resolves -- `mise upgrade` runs whatever
// Node is first on PATH, so minNode still matters here the way it does for a plain npm install.
/** @type {typeof Source.mise} */
() => Source.npm();
