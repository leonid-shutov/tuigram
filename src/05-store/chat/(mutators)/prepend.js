// `older` is oldest-first, so it lands contiguous with the head of the current window.
Mutation(
  self,
  /** @type {ChatStoreSelf['prepend']} */
  (older) => void self.messages.unshift(...older),
);
