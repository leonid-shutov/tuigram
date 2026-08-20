const dialogs = ui.sections.dialogs;
const chunkSize = 10;
void Array.fromAsync(AsyncIterator.take(messenger.iterDialogs({ chunkSize }), chunkSize)).then(dialogs.setDialogs);
void Array.fromAsync(messenger.iterDialogs()).then(dialogs.setDialogs);
void Array.fromAsync(messenger.iterDialogs({ archived: true })).then(dialogs.setArchived);
