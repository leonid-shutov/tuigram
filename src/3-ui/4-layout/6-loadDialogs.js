const chunkSize = 10;
Array.fromAsync(AsyncIterator.take(messenger.iterDialogs(chunkSize), chunkSize)).then(
  ui.sections.dialogs.setDialogs,
);
void Array.fromAsync(messenger.iterDialogs()).then(ui.sections.dialogs.setDialogs);
