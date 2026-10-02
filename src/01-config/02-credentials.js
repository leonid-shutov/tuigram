// Telegram api_ids are positive integers; anything else is not a key.
const API_ID = /^[1-9]\d*$/u;

/** @type {(value: unknown) => value is string} */
const filled = (value) => typeof value === 'string' && value.trim() !== '';

// Each source hands over both halves or nothing: an id from one key and a hash from another
// authenticates nothing. Your own key (env, then file) always outranks the shipped one.
/** @typedef {typeof config.credentials | null} Found */

/** @type {() => Found} */
const fromEnv = () => {
  const apiId = process.env.TUIGRAM_API_ID;
  const apiHash = process.env.TUIGRAM_API_HASH;
  if (!filled(apiId) || !filled(apiHash)) return null;
  return { apiId: apiId.trim(), apiHash: apiHash.trim(), source: 'env' };
};

/** @type {() => Found} */
const fromFile = () => {
  const read = Result.from(() => node.fs.readFileSync(config.paths.credentials, 'utf8'));
  if (!read.ok) return null;
  const parsed = Result.from(() => JSON.parse(read.unwrap()));
  if (!parsed.ok) return null;
  const { apiId, apiHash } = parsed.unwrap();
  if (!filled(apiId) || !filled(apiHash)) return null;
  return { apiId: apiId.trim(), apiHash: apiHash.trim(), source: 'file' };
};

// app-key.json exists only in the npm tarball (scripts/write-app-key.js); a git checkout has none.
// A missing or unreadable file, or one that does not decode to a positive id and a hash, counts
// as no key at all.
/** @type {() => Found} */
const fromShipped = () => {
  const read = Result.from(() => node.fs.readFileSync(node.path.join(__rootDir, 'app-key.json'), 'utf8'));
  if (!read.ok) return null;
  const parsed = Result.from(() => JSON.parse(read.unwrap()));
  if (!parsed.ok) return null;
  const apiId = Base64.decodeFragments(parsed.unwrap()?.id);
  const apiHash = Base64.decodeFragments(parsed.unwrap()?.hash);
  if (!API_ID.test(apiId) || apiHash === '') return null;
  return { apiId, apiHash, source: 'shipped' };
};

fromEnv() ?? fromFile() ?? fromShipped() ?? { apiId: undefined, apiHash: undefined, source: undefined };
