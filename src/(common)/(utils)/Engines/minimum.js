// Understands only a leading `>=`, which is all this project has ever published in
// package.json's `engines.node` -- anything else (a range, a caret, missing) is unknown, and
// unknown means no warning rather than a guess.
const RANGE = /^\s*>=\s*(\d+\.\d+\.\d+)/u;

/** @type {typeof Engines.minimum} */
(range) => {
  if (typeof range !== 'string') return null;
  const match = RANGE.exec(range);
  return match === null ? null : match[1];
};
