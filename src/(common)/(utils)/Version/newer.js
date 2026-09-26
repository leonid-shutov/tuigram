// The policy, not just the ordering: a prerelease is never offered to someone running a stable
// build. Without this, `npm publish` on a `-beta`/`-rc` tag (nothing in publish.yml passes
// `--tag`, so it lands straight on dist-tags.latest) would announce itself to every stable user.
/** @type {typeof Version.newer} */
(candidate, current) => {
  if (Version.compare(candidate, current) <= 0) return false;
  const parsed = Version.parse(candidate);
  const running = Version.parse(current);
  if (parsed === null || running === null) return false;
  return parsed.pre.length === 0 || running.pre.length > 0;
};
