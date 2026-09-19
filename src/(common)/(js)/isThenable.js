/** @type {typeof isThenable} */
(value) => {
  if (typeof value !== 'object' || value === null) return false;
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const candidate = /** @type {any} */ (value);
  return typeof candidate.then === 'function';
};
