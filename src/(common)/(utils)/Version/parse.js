// Strict on purpose: we only ever compare versions this project itself publishes, so anything
// that doesn't fit MAJOR.MINOR.PATCH[-pre][+build] with a numeric core is treated as unparseable
// rather than guessed at. Build metadata is read but dropped — semver says it never affects
// precedence.
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9a-zA-Z.-]+))?(?:\+[0-9a-zA-Z.-]+)?$/u;

/** @type {typeof Version.parse} */
(version) => {
  const match = SEMVER.exec(version);
  if (match === null) return null;
  const [, major, minor, patch, pre] = match;
  return {
    core: [Number(major), Number(minor), Number(patch)],
    pre: pre === undefined ? [] : pre.split('.').map((part) => (/^\d+$/u.test(part) ? Number(part) : part)),
  };
};
