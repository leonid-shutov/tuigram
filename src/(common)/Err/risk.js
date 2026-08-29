// @ts-check
/** @type {typeof Err.risk} */
(fn, ...args) => {
  try {
    const result = fn(...args);
    return [null, result];
  } catch (err) {
    return [err, null];
  }
};
