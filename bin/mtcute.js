'use strict';

// mtcute's CommonJS bundles print an ESM deprecation notice on first require unless this is set
// first; src/'s own `npm['@mtcute/node']` comes later, so it stays quiet too.
globalThis._MTCUTE_CJS_DEPRECATION_WARNED = true;

module.exports = require('@mtcute/node');
