// Telegram lists an album as one message per part, and a page can end partway through one. So
// album parts are collected until a message that isn't part of the album shows up — only then is
// the album known to be whole and turned into one message. Parts still collecting when a page
// ends wait for the next page.
(() =>
  /** @type {MessengerModule['getHistory']} */
  async function* (chatId, firstPageSize, pageSize = firstPageSize) {
    let offset = undefined;
    let limit = firstPageSize;
    /** The parts of the album being collected. @type {import('@mtcute/node').Message[]} */
    let album = [];

    while (true) {
      // the first message in the array is the most recent message in the chat
      const history = await messenger.tg.getHistory(chatId, { offset, limit });
      const isLastPage = history.next === undefined;

      /** @type {import('../../../types/domain').Message[]} */
      const page = [];
      for (const message of history) {
        const isOutsideAlbum = album.length > 0 && message.groupedIdUnique !== album[0].groupedIdUnique;
        if (isOutsideAlbum) {
          page.push(Message.fromAlbum(album));
          album = [];
        }
        if (message.groupedIdUnique === null) page.push(Message.from(message));
        else album.push(message);
      }
      // Nothing older is coming, so the album being collected is as whole as it gets.
      if (isLastPage && album.length > 0) page.push(Message.fromAlbum(album));

      yield page;

      if (isLastPage) return;
      offset = history.next;
      limit = pageSize;
    }
  })();
