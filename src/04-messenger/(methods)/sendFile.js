const { InputMedia } = npm['@mtcute/node'];

/** @type {MessengerModule['sendFile']} */
(chatId, filePath, params) =>
  messenger.tg
    .sendMedia(chatId, InputMedia.auto(`file:${filePath}`, { fileName: node.path.basename(filePath), ...params }), {})
    .then(Message.from);
