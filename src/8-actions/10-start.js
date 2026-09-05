// Runs last: everything below is loaded, so this is where the wires get connected.

// The two async capabilities the chat view needs; see 6-ui/1-sections/2-chat/(public)/connect.js.
ui.sections.chat.connect({
  loadOlder: self.loadOlder,
  loadThumb: messenger.downloadThumb,
});

// Events up: user intent from the sections, server updates from the messenger.
ui.sections.dialogs.on('open', self.openChat);
ui.sections.picker.on('pick', self.openChat);
ui.sections.picker.on('close', () => navigation.select('chat'));
ui.sections.messagePrompt.on('send', self.send);
ui.sections.messagePrompt.on('exit', () => navigation.select('chat'));
messenger.onNewMessage(self.receiveMessage);
messenger.onHistoryRead(self.historyRead);

// Two passes: a short first page so the list draws almost immediately, then the full set.
const chunkSize = 10;
const load = async () => {
  const first = await Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize));
  store.dialogs.setAll(first);
  self.repaintDialogs();

  const all = await Array.fromAsync(messenger.iterDialogs());
  store.dialogs.setAll(all);
  self.repaintDialogs();

  store.dialogs.setArchived(await Array.fromAsync(messenger.iterDialogs({ archived: true })));
};

void load();
