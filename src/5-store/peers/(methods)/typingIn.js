/** @type {PeersStoreSelf['typingIn']} */
(chatId) => Array.from(self.typing.get(chatId) ?? [], ([userId, { status }]) => ({ userId, status }));
