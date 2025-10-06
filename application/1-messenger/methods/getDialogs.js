async () => {
  const dialogs = messenger.tg.iterDialogs({ chunkSize: 20 });
  return dialogs;
};
