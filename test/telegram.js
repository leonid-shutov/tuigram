'use strict';

const path = require('node:path');
const { Long, NodePlatform } = require('../bin/mtcute.js');
const { NodeCryptoProvider } = require('@mtcute/node/utils.js');

// Imported by file: the package entry point only loads under vitest (docs/MTCUTE_BUGS.md).
const STUB = path.resolve(__dirname, '..', 'node_modules', '@mtcute', 'test', 'client.js');

const SELF_ID = 1;
const MAX_CALLS = 2000;

const peerUser = (userId) => ({ _: 'peerUser', userId });
const tlUser = ({ id, firstName, lastName, self = false }) => ({
  _: 'user',
  id,
  self,
  accessHash: Long.fromNumber(id),
  firstName,
  lastName,
});

/** A fake Telegram account, faked at the wire under the real client (docs/TESTING.md). */
const createTelegram = async () => {
  const { StubTelegramClient } = await import(STUB);
  // Each option overrides a stub default that breaks on Node or drops updates (docs/MTCUTE_BUGS.md).
  const client = new StubTelegramClient({
    disableUpdates: false,
    crypto: new NodeCryptoProvider(),
    platform: new NodePlatform(),
  });

  const self = tlUser({ id: SELF_ID, firstName: 'Me', self: true });
  const users = new Map([[SELF_ID, self]]);
  // Each chat's messages, oldest first; a chat is here once it has one.
  const chats = new Map();
  const unanswered = [];
  let callCount = 0;
  let nextUserId = 100;

  // Signed in, or mtcute drops every update (docs/MTCUTE_BUGS.md).
  await client.prepare();
  await client.storage.self.store({ userId: SELF_ID, isBot: false, isPremium: false, usernames: [] });

  const allUsers = () => [...users.values()];
  const historyOf = (userId) => chats.get(userId) ?? [];
  const lastOf = (userId) => historyOf(userId).at(-1);

  const addMessage = (userId, text, { out = false } = {}) => {
    const message = {
      _: 'message',
      id: client.getNextMessageId(),
      out,
      peerId: peerUser(userId),
      fromId: peerUser(out ? SELF_ID : userId),
      date: client.getNextDate(),
      message: text,
    };
    if (chats.has(userId)) chats.get(userId).push(message);
    else chats.set(userId, [message]);
    return message;
  };

  const dialogOf = (userId) => ({
    _: 'dialog',
    peer: peerUser(userId),
    topMessage: lastOf(userId).id,
    readInboxMaxId: 0,
    readOutboxMaxId: 0,
    unreadCount: historyOf(userId).filter((message) => !message.out).length,
    unreadMentionsCount: 0,
    unreadReactionsCount: 0,
    notifySettings: { _: 'peerNotifySettings' },
  });

  const answers = {
    'users.getUsers': ({ id }) =>
      id.map((input) => (input._ === 'inputUserSelf' ? self : users.get(input.userId))).filter(Boolean),
    'updates.getState': () => ({
      _: 'updates.state',
      pts: 0,
      qts: 0,
      date: client.getNextDate(),
      seq: 0,
      unreadCount: 0,
    }),
    'updates.getDifference': () => ({ _: 'updates.differenceEmpty', date: client.getNextDate(), seq: 0 }),
    'messages.getDialogFilters': () => ({ _: 'messages.dialogFilters', filters: [] }),
    // Every dialog fits on the first page, so any later page (one with an offset) is empty.
    'messages.getDialogs': ({ offsetId }) => {
      const page = offsetId === 0 ? [...chats.keys()].toSorted((a, b) => lastOf(b).id - lastOf(a).id) : [];
      return {
        _: 'messages.dialogs',
        dialogs: page.map(dialogOf),
        messages: page.map(lastOf),
        chats: [],
        users: allUsers(),
      };
    },
    // Newest first, below `offsetId` when there is one, `limit` at a time.
    'messages.getHistory': ({ peer, offsetId, limit }) => {
      const history = historyOf(peer.userId);
      const below = offsetId === 0 ? history : history.filter((message) => message.id < offsetId);
      return { _: 'messages.messages', messages: below.toReversed().slice(0, limit), chats: [], users: allUsers() };
    },
    'messages.readHistory': () => ({ _: 'messages.affectedMessages', pts: client.getNextPts(), ptsCount: 1 }),
  };
  // Replaces the stub's own `call`, under which a method with no answer hangs instead of failing.
  client.call = async (request) => {
    callCount += 1;
    // Answer on a later turn, as a real server does, or a paging loop starves every timer
    // (docs/MTCUTE_BUGS.md, `iterDialogs`).
    await new Promise(setImmediate);
    if (callCount > MAX_CALLS) throw new Error(`fake Telegram: over ${MAX_CALLS} calls, last ${request._}`);
    if (!Object.hasOwn(answers, request._)) {
      unanswered.push(request._);
      throw new Error(`fake Telegram has no answer for ${request._}`);
    }
    return answers[request._](request);
  };

  return {
    /** The stub mtcute's `TelegramClient` runs on (test/world.js). */
    client,
    unanswered,

    user: async ({ firstName, lastName }) => {
      const user = tlUser({ id: nextUserId++, firstName, lastName });
      users.set(user.id, user);
      await client.registerPeers(user);
      return user.id;
    },

    message: (userId, text, options) => void addMessage(userId, text, options),

    receive: (userId, text) => {
      const message = addMessage(userId, text);
      const update = { _: 'updateNewMessage', message, pts: client.getNextPts(), ptsCount: 1 };
      client.onServerUpdate.emit(client.createStubUpdates({ updates: [update], peers: [userId] }));
    },
  };
};

module.exports = { createTelegram };
