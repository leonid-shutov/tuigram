// @ts-check
/** @type {(path: string, encoding: BufferEncoding) => string} */
const readFileSync = node.fs.readFileSync;
const [error, file] = Err.risk(readFileSync, paths.settings, 'utf8');
// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
if (error === null) JSON.parse(/** @type {string} */ (file));
else /** @type {import('../../../types/config').Source} */ ({});
