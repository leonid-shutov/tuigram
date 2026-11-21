// An emoji interaction rides the same update but isn't anyone typing, and a draft's end stops it as
// a cancel does. A topic's typing counts for the whole chat: the pane shows no topics.
/** @type {MessengerModule['onUserTyping']} */
(handler) =>
  messenger.dispatcher.onUserTyping(({ chatId, userId, status }) => {
    if (status === 'interaction' || status === 'interaction_seen') return;
    handler({ chatId, userId, status: status === 'cancel' || status === 'stop_draft' ? null : status });
  });
