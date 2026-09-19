/** @type {typeof Explain.line} */
(error) => {
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const candidate = /** @type {any} */ (error);
  const line = candidate?.text ?? candidate?.message ?? String(error);
  return String(line).split('\n')[0].trim();
};
