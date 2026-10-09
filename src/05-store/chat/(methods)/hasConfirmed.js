/** @type {ChatStoreSelf['hasConfirmed']} */
(messageId) => self.messages.some(({ id, pending }) => !pending && id === messageId);
