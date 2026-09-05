/** @type {ChatSection['setThumb']} */
(messageId, bytes) => {
  const image = self.pictures.get(messageId);
  if (image !== undefined) image.source = bytes;
};
