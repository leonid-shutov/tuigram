// The app folds an album into one message under one part's id; acting on that id alone would
// reach a single picture, so an album asks Telegram for all of its parts first.
/** @type {MessengerSelf['albumIds']} */
async (chatId, message) => {
  if (message.media.length < 2) return [message.id];
  const parts = await messenger.tg.getMessageGroup({ chatId, message: message.id });
  return parts.map((part) => part.id);
};
