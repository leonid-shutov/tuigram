// `open` writes the id to `self`, which shadows the module property rather than updating it —
// so this accessor, not `store.chat.chatId`, is how the rest of the app asks what is open.
/** @type {ChatStore['opened']} */
() => self.chatId;
