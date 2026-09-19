messenger.dispatcher.onError((error) => {
  ui.errors.report('Something went wrong.', error);
  return true;
});

void messenger.onNewMessage(actions.receiveMessage);
void messenger.onHistoryRead(actions.historyRead);
