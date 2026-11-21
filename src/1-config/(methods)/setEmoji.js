// The dialogs list and the chat title read `config.emojis` as they paint, so the caller repaints them.
/** @type {typeof config.setEmoji} */
(chatId, glyph) => {
  if (glyph === null) config.emojis.delete(chatId);
  else config.emojis.set(chatId, glyph);
  const json = `${JSON.stringify(Object.fromEntries(config.emojis), null, 2)}\n`;
  return Cache.write(config.paths.emojis, node.buffer.Buffer.from(json));
};
