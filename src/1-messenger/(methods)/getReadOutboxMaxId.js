async (chatId) => {
  const [dialog] = await messenger.tg.getPeerDialogs([chatId]);
  return dialog?.lastReadOutgoing ?? 0;
};
