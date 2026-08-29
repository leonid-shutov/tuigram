// @ts-check
/** @type {typeof Obj.pick} */
// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
(obj, keys) => /** @type {any} */ (Object.fromEntries(keys.map((key) => [key, obj[key]])));
