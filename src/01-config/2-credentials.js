/** @type {(value: unknown) => value is string} */
const filled = (value) => typeof value === 'string' && value.trim() !== '';

const fromEnv = () => {
  const apiId = process.env.TUIGRAM_API_ID;
  const apiHash = process.env.TUIGRAM_API_HASH;
  if (!filled(apiId) || !filled(apiHash)) return null;
  return { apiId: apiId.trim(), apiHash: apiHash.trim() };
};

/** @type {(path: string, encoding: BufferEncoding) => string} */
const readCredentialsFile = node.fs.readFileSync;

const fromFile = () => {
  const [readError, file] = Err.risk(readCredentialsFile, config.paths.credentials, 'utf8');
  if (readError !== null) return null;
  const [parseError, parsed] = Err.risk(JSON.parse, file);
  if (parseError !== null) return null;
  const { apiId, apiHash } = parsed;
  if (filled(apiId) && filled(apiHash)) return { apiId: apiId.trim(), apiHash: apiHash.trim() };
  else return null;
};

fromEnv() ?? fromFile() ?? { apiId: undefined, apiHash: undefined };
