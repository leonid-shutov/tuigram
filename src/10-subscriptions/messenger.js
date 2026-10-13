messenger.dispatcher.onError((error) => {
  ui.errors.report('Something went wrong.', error);
  return true;
});

void messenger.onNewMessage(actions.receiveMessage);
void messenger.onEditMessage(actions.messageEdited);
void messenger.onHistoryRead(actions.historyRead);
void messenger.onDeleteMessage(actions.messagesDeleted);
void messenger.onPresenceUpdate(actions.presenceUpdate);
void messenger.onFoldersChange(actions.loadFolders);
