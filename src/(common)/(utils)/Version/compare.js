/** @param {number | string} a @param {number | string} b */
const compareIdentifier = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') return a === b ? 0 : a < b ? -1 : 1;
  // Semver §11.4.3: numeric identifiers always rank lower than alphanumeric ones.
  if (typeof a === 'number') return -1;
  if (typeof b === 'number') return 1;
  return a === b ? 0 : a < b ? -1 : 1;
};

/** @type {typeof Version.compare} */
(left, right) => {
  const a = Version.parse(left);
  const b = Version.parse(right);
  // Garbage on either side must never produce a spurious "update available" — treat it as a tie.
  if (a === null || b === null) return 0;

  for (let i = 0; i < 3; i++) {
    if (a.core[i] !== b.core[i]) return a.core[i] < b.core[i] ? -1 : 1;
  }

  // Equal core: no prerelease outranks any prerelease (semver §11.3).
  if (a.pre.length === 0 && b.pre.length === 0) return 0;
  if (a.pre.length === 0) return 1;
  if (b.pre.length === 0) return -1;

  const len = Math.min(a.pre.length, b.pre.length);
  for (let i = 0; i < len; i++) {
    const cmp = compareIdentifier(a.pre[i], b.pre[i]);
    if (cmp !== 0) return cmp;
  }
  // Identical prefix: the shorter identifier list ranks lower (semver §11.4.4).
  return a.pre.length === b.pre.length ? 0 : a.pre.length < b.pre.length ? -1 : 1;
};
