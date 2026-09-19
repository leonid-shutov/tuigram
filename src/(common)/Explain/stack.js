/** @type {typeof Explain.stack} */
(error) => {
  if (typeof error === 'object' && error !== null && 'stack' in error) {
    if (typeof error.stack === 'string') return error.stack;
  }
  return String(error);
};
