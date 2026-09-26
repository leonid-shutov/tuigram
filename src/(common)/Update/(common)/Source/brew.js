const FORMULA = 'https://raw.githubusercontent.com/leonid-shutov/homebrew-tap/master/Formula/tuigram.rb';
// The formula has no `version` field -- brew derives it from the tarball url, so parsing that
// line is exactly the version `brew upgrade` would install.
const URL_LINE = /^\s*url\s+"https:\/\/registry\.npmjs\.org\/tuigram\/-\/tuigram-(\d[^"]*)\.tgz"/mu;

/** @type {typeof Source.brew} */
async () => {
  const body = await Fetch.text(FORMULA, {
    accept: 'text/plain',
    'accept-encoding': 'identity',
    'user-agent': `tuigram/${packageVersion}`,
  });
  if (body === null) return null;

  const match = URL_LINE.exec(body);
  // The formula's own `depends_on "node"` handles the Node version, so unlike npm there is
  // nothing here to warn about.
  return match === null ? null : { version: match[1], minNode: null };
};
