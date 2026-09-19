void messenger.onNewMessage(actions.receiveMessage); // unwrapped -> crash: store then UI writes must not desync
void messenger.onHistoryRead(Guard.soft(actions.historyRead, 'Could not update read receipts.'));
