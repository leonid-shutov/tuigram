// The dialog list, a page per request and newest chats first: the main list, then the archive. Each
// page lands as it comes, and the first is enough to start caching the top chats.
/** @type {Actions['loadDialogs']} */
async () => {
  let preloading = false;
  try {
    for await (const dialogs of messenger.iterDialogPages()) {
      store.dialogs.land(dialogs);
      if (!preloading) void actions.preloadChats();
      preloading = true;
    }
    ui.dialogs.settle();
  } catch (error) {
    ui.dialogs.settle(error);
  }
  try {
    for await (const dialogs of messenger.iterDialogPages({ archived: true })) store.dialogs.land(dialogs);
  } catch (error) {
    Crash.soft(error);
  }
};
