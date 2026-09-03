/** @type {typeof Emoji.fromHash} */
(chatId) => Emoji.pool[Hash.fnv1a(String(chatId)) % Emoji.pool.length];
