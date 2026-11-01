// The glyph set by hand, or the hashed one when there is none.
/** @type {typeof Emoji.of} */
(chatId, assigned) => assigned ?? Emoji.fromHash(chatId);
