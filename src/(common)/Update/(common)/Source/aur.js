const ENDPOINT = 'https://aur.archlinux.org/rpc/v5/info?arg[]=tuigram';

// AUR's Version is `[epoch:]pkgver-pkgrel` (e.g. "1.2.0-1"); only pkgver lines up with
// package.json and the strict MAJOR.MINOR.PATCH our Version.* utils parse -- left as-is, the
// trailing `-pkgrel` reads as a semver prerelease and Version.newer would refuse to ever offer it.
/** @param {string} version */
const pkgver = (version) => version.replace(/^\d+:/u, '').replace(/-[^-]+$/u, '');

/** @type {typeof Source.aur} */
async () => {
  const body = await Fetch.text(ENDPOINT, {
    accept: 'application/json',
    'accept-encoding': 'identity',
    'user-agent': `tuigram/${packageVersion}`,
  });
  if (body === null) return null;

  const parsed = Result.from(() => JSON.parse(body));
  if (!parsed.ok) return null;
  const payload = parsed.unwrap();

  const version = payload?.results?.[0]?.Version;
  if (typeof version !== 'string') return null;

  // pacman's own `depends=(nodejs)` line handles the Node version, so unlike npm there is
  // nothing here to warn about.
  return { version: pkgver(version), minNode: null };
};
