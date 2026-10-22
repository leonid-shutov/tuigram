// Every spot on screen has one repaint, subscribed to each store it reads.
store.dialogs.on('change', actions.repaintDialogs);
store.folders.on('change', actions.repaintDialogs);

store.chat.on('change', actions.repaintChat);

store.chat.on('change', actions.repaintChatTitle);
store.dialogs.on('change', actions.repaintChatTitle);

store.chat.on('change', actions.repaintReceipt);
store.dialogs.on('change', actions.repaintReceipt);

store.chat.on('change', actions.repaintPresence);
store.peers.on('change', actions.repaintPresence);
