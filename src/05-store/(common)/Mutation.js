/** @type {typeof Mutation} */
(store, mutate) =>
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  /** @type {any} */ (
    (/** @type {unknown[]} */ ...args) => {
      const result = mutate(...args);
      store.emit('change');
      return result;
    }
  );
