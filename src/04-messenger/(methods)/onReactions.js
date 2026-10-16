// mtcute parses only the bots' reaction updates; a user account's `updateMessageReactions` comes
// through raw. It is how reactions on our own messages reach a group or a channel, and how our own
// choice made on another device reaches this one. (A private chat sends its reactions as a hidden
// edit instead — see onEditMessage.)
const { MessageReactions, getMarkedPeerId: markedIdOf } = npm['@mtcute/node'];

/** @type {MessengerModule['onReactions']} */
(handler) =>
  messenger.dispatcher.onRawUpdate(
    (_client, update) => update._ === 'updateMessageReactions',
    (_client, update, peers) => {
      if (update._ !== 'updateMessageReactions') return;
      const chatId = markedIdOf(update.peer);
      const reactions = new MessageReactions(update.msgId, chatId, update.reactions, peers);
      handler({ chatId, messageId: update.msgId, reactions: self.toReactions(reactions) });
    },
  );
