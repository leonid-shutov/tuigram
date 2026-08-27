/** @type {ChatSelf['key']} */
({ name }) => {
  /** @type {Record<string, (() => unknown) | undefined>} */
  const bindings = { k: self.up, j: self.down };
  bindings[name]?.();
};
