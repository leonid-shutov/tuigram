/** @type {ChatSelf['key']} */
({ name }) => {
  /** @type {Record<string, (() => unknown) | undefined>} */
  const bindings = { k: self.up, л: self.up, up: self.up, j: self.down, о: self.down, down: self.down };
  bindings[name]?.();
};
