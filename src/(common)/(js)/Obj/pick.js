// @ts-check
/**
 * @template {object} T
 * @template {keyof T} K
 * @param {T} obj
 * @param {K[]} keys
 * @returns {Pick<T, K>}
 */
// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
(obj, keys) => /** @type {Pick<T, K>} */ (Object.fromEntries(keys.map((key) => [key, obj[key]])));
