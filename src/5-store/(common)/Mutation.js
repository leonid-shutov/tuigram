// The mutator's arguments ride along with `change`, so a store can tell what changed: store.chat
// emits only for the open chat.
/** @type {typeof Mutation} */
(store, mutate) =>
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  /** @type {any} */ (
    (/** @type {unknown[]} */ ...args) => {
      const result = mutate(...args);
      store.emit('change', ...args);
      return result;
    }
  );
