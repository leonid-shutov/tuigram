Mutation(
  self,
  /** @type {ChatStoreSelf['drop']} */
  (tempId) => {
    const index = self.messages.findIndex(({ id }) => id === tempId);
    if (index !== -1) self.messages.splice(index, 1);
  },
);
