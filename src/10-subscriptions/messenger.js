messenger.dispatcher.onError((error) => {
  actions.reportError(error, 'Something went wrong.');
  return true;
});

void messenger.onNewMessage(actions.receiveMessage);
void messenger.onHistoryRead(actions.historyRead);
