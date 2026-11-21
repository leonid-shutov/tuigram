// Telegram lists an album as one message per part, and a page can end partway through one. So
// album parts are collected until a message that isn't part of the album shows up — only then is
// the album known to be whole and turned into one message. The album a page ends on is held back
// unless nothing older is left: the next page, asked for from below this one's oldest message,
// starts with it whole.
/** @type {MessengerModule['getPage']} */
async (chatId, { before = null, limit } = {}) => {
  let offset = undefined;
  let size = config.history.firstPageSize;
  if (before !== null) {
    const partIds = await self.albumIds(chatId, before);
    offset = { id: Math.min(...partIds), date: 0 };
    size = config.history.pageSize;
  }

  // the first message in the array is the most recent message in the chat
  const history = await messenger.tg.getHistory(chatId, { offset, limit: limit ?? size });
  const isLastPage = history.next === undefined;

  /** @type {import('../../../types/domain').Message[]} */
  const page = [];
  /** The parts of the album being collected. @type {import('@mtcute/node').Message[]} */
  let album = [];
  for (const message of history) {
    const isOutsideAlbum = album.length > 0 && message.groupedIdUnique !== album[0].groupedIdUnique;
    if (isOutsideAlbum) {
      page.push(self.toAlbum(album));
      album = [];
    }
    if (message.groupedIdUnique === null) page.push(self.toMessage(message));
    else album.push(message);
  }
  // Nothing older is coming, so the album being collected is as whole as it gets.
  if (isLastPage && album.length > 0) page.push(self.toAlbum(album));
  return page;
};
