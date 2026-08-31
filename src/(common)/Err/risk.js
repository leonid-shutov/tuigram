/** @type {typeof Err.risk} */
(fn, ...args) => {
  try {
    const result = fn(...args);
    return [null, result];
  } catch (err) {
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    return [/** @type {Error} */ (err), null];
  }
};
