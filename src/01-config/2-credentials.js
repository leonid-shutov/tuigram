/** @type {(value: unknown) => value is string} */
const filled = (value) => typeof value === 'string' && value.trim() !== '';

const fromEnv = () => {
  const apiId = process.env.TUIGRAM_API_ID;
  const apiHash = process.env.TUIGRAM_API_HASH;
  if (!filled(apiId) || !filled(apiHash)) return null;
  return { apiId: apiId.trim(), apiHash: apiHash.trim() };
};

const fromFile = () => {
  const read = Result.from(() => node.fs.readFileSync(config.paths.credentials, 'utf8'));
  if (!read.ok) return null;
  const parsed = Result.from(() => JSON.parse(read.unwrap()));
  if (!parsed.ok) return null;
  const { apiId, apiHash } = parsed.unwrap();
  if (filled(apiId) && filled(apiHash)) return { apiId: apiId.trim(), apiHash: apiHash.trim() };
  else return null;
};

fromEnv() ?? fromFile() ?? { apiId: undefined, apiHash: undefined };
