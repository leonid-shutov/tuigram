const fromEnv = () => {
  const apiId = process.env.TUIGRAM_API_ID;
  const apiHash = process.env.TUIGRAM_API_HASH;
  if (apiId === undefined || apiHash === undefined) return null;
  return { apiId, apiHash };
};

/** @type {(path: string, encoding: BufferEncoding) => string} */
const readCredentialsFile = node.fs.readFileSync;

const fromFile = () => {
  const [readError, file] = Err.risk(readCredentialsFile, paths.credentials, 'utf8');
  if (readError !== null) return null;
  // Destructuring before the guard would throw on a corrupt file: risk() returns null there.
  const [parseError, parsed] = Err.risk(JSON.parse, file);
  if (parseError !== null) return null;
  const { apiId, apiHash } = parsed;
  if (typeof apiId === 'string' && typeof apiHash === 'string') return { apiId, apiHash };
  else return null;
};

fromEnv() ?? fromFile() ?? { apiId: undefined, apiHash: undefined };
