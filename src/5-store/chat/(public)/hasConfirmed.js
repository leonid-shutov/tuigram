// Pending entries carry random client-side ids, so they never match.
/** @type {ChatStore['hasConfirmed']} */
(messageId) => self.messages.some(({ id, pending }) => !pending && id === messageId);
