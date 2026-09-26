// The row and the action must agree on this: offering an upgrade the running Node can't take
// (or letting alt+u run it) is worse than saying nothing useful, so both call this instead of
// each re-deriving the same check.
/** @type {typeof Update.blockedByNode} */
(release) => {
  if (release.minNode === null) return false;
  return Version.compare(release.minNode, process.versions.node) > 0;
};
