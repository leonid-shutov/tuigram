const FIRST_PAGE = 25;
const PAGE = 100;

(() =>
  /** @type {MessengerModule['iterDialogPages']} */
  async function* ({ archived = false } = {}) {
    const seen = new Set();
    /** @type {{ offsetPeer?: import('@mtcute/node').tl.TypeInputPeer, offsetId?: number, offsetDate?: Date }} */
    let offset = {};
    for (let limit = FIRST_PAGE; ; limit = PAGE) {
      const source = messenger.tg.iterDialogs({ ...offset, limit, archived: archived ? 'only' : 'exclude' });
      const dialogs = await Array.fromAsync(source);
      const page = dialogs.filter(({ peer }) => !seen.has(peer.id) && seen.add(peer.id));
      yield page.map(self.toDialog);

      const last = dialogs.at(-1);
      if (last === undefined || dialogs.length < limit) return;
      // mtcute reads a number as milliseconds, so the date goes over as a Date.
      const offsetDate = last.lastMessage?.date ?? offset.offsetDate;
      offset = { offsetPeer: last.peer.inputPeer, offsetId: last.raw.topMessage, offsetDate };
    }
  })();
