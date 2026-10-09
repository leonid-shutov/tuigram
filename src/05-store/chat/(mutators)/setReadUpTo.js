Mutation(
  self,
  /** @type {ChatStoreSelf['setReadUpTo']} */
  (maxReadId) => void (self.readUpTo = Math.max(self.readUpTo, maxReadId)),
);
