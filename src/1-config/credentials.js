const fromEnv = () => {
  const apiId = process.env.TUIGRAM_API_ID;
  const apiHash = process.env.TUIGRAM_API_HASH;
  if (apiId === undefined || apiHash === undefined) return null;
  return { apiId, apiHash };
};

const fromFile = () => {
  const [readError, file] = Err.risk(node.fs.readFileSync, paths.credentials, 'utf8');
  if (readError !== null) return null;
  const [parseError, { apiId, apiHash }] = Err.risk(JSON.parse, file);
  if (parseError !== null) return null;
  if (typeof apiId === 'string' && typeof apiHash === 'string') return { apiId, apiHash };
  else return null;
};

fromEnv() ?? fromFile() ?? { apiId: undefined, apiHash: undefined };
