Mutation(
  self,
  /** @type {ChatStoreSelf['replace']} */
  (message, heldId = message.id) => {
    const index = self.messages.findIndex(({ id }) => id === heldId);
    if (index === -1) Crash.hard(new Error(`message ${heldId} is not held`));
    self.messages[index] = message;
  },
);
