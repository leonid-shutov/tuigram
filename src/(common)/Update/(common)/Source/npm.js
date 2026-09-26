const REGISTRY = 'https://registry.npmjs.org/tuigram';
// The abbreviated packument: a few KB instead of every version ever published, and it still
// carries dist-tags and each version's `engines`.
const ACCEPT = 'application/vnd.npm.install-v1+json';

/** @type {typeof Source.npm} */
async () => {
  const body = await Fetch.text(REGISTRY, {
    accept: ACCEPT,
    'accept-encoding': 'identity',
    'user-agent': `tuigram/${packageVersion}`,
  });
  if (body === null) return null;

  const parsed = Result.from(() => JSON.parse(body));
  if (!parsed.ok) return null;
  const packument = parsed.unwrap();

  const latest = packument?.['dist-tags']?.latest;
  if (typeof latest !== 'string') return null;

  return { version: latest, minNode: Engines.minimum(packument?.versions?.[latest]?.engines?.node) };
};
