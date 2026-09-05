// Runs last: unprefixed, because the src root loads in plain alphabetical order and letters
// sort after digits. Every layer above is loaded, so this is where the app is kicked into motion.

// The two async capabilities the chat view needs; see 6-ui/2-chat/(public)/connect.js.
ui.chat.connect({
  loadOlder: actions.loadOlder,
  loadThumb: messenger.downloadThumb,
});

// Two passes: a short first page so the list draws almost immediately, then the full set.
const chunkSize = 10;
const load = async () => {
  const first = await Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize));
  store.dialogs.setAll(first);
  actions.repaintDialogs();

  const all = await Array.fromAsync(messenger.iterDialogs());
  store.dialogs.setAll(all);
  actions.repaintDialogs();

  store.dialogs.setArchived(await Array.fromAsync(messenger.iterDialogs({ archived: true })));
};

void load();
