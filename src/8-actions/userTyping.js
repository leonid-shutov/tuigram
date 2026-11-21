/** @type {Actions['userTyping']} */
({ chatId, userId, status }) => store.peers.setTyping(chatId, userId, status);
