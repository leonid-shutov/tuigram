/** @type {ChatSection['setThumb']} */
(messageId, bytes) => {
  const picture = self.bubbles.get(messageId)?.picture ?? null;
  if (picture !== null) picture.source = bytes;
};
