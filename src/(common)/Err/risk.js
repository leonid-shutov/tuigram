// @ts-check
/**
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {Parameters<F>} args
 * @returns {[null, ReturnType<F>] | [unknown, null]}
 */
(fn, ...args) => {
  try {
    const result = fn(...args);
    return [null, result];
  } catch (err) {
    return [err, null];
  }
};
