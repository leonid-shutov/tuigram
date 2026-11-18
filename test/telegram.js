'use strict';

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { Long, NodePlatform } = require('../bin/mtcute.js');
const { NodeCryptoProvider } = require('@mtcute/node/utils.js');

// Imported by file: the package entry point only loads under vitest (docs/MTCUTE_BUGS.md). As a
// file:// URL, since import() reads a Windows path's drive letter (`D:`) as a URL scheme.
const STUB = pathToFileURL(path.resolve(__dirname, '..', 'node_modules', '@mtcute', 'test', 'client.js')).href;

const SELF_ID = 1;
const MAX_CALLS = 2000;

const peerUser = (userId) => ({ _: 'peerUser', userId });
const tlUser = ({ id, firstName, lastName, self = false, status }) => ({
  _: 'user',
  id,
  self,
  accessHash: Long.fromNumber(id),
  firstName,
  lastName,
  status,
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
  // Each chat's read position: the id of the newest message the account has read in it.
  const readUpTo = new Map();
  // Each chat's deleted messages, in the order they went: `{ message, forEveryone }`.
  const deletions = new Map();
  const unanswered = [];
  let callCount = 0;
  let nextUserId = 100;

  // Signed in, or mtcute drops every update (docs/MTCUTE_BUGS.md).
  await client.prepare();
  await client.storage.self.store({ userId: SELF_ID, isBot: false, isPremium: false, usernames: [] });
  // Known to the stub too, so an update about the account's own message can name its sender.
  await client.registerPeers(self);

  const allUsers = () => [...users.values()];
  const historyOf = (userId) => chats.get(userId) ?? [];
  const lastOf = (userId) => historyOf(userId).at(-1);
  const unreadIn = (userId) =>
    historyOf(userId).filter((message) => !message.out && message.id > (readUpTo.get(userId) ?? 0)).length;
  // A `maxId` of 0 reads the whole chat, as on Telegram.
  const markRead = (userId, maxId = 0) => {
    const newest = lastOf(userId)?.id ?? 0;
    readUpTo.set(userId, maxId === 0 ? newest : maxId);
  };

  // `replyTo` is the id of the message it replies to, in the same chat.
  // `forwardedFrom` is the original's header, when it is a forwarded copy.
  const addMessage = (userId, text, { out = false, replyTo = null, forwardedFrom = null } = {}) => {
    const message = {
      _: 'message',
      id: client.getNextMessageId(),
      out,
      peerId: peerUser(userId),
      fromId: peerUser(out ? SELF_ID : userId),
      date: client.getNextDate(),
      message: text,
      replyTo: replyTo === null ? undefined : { _: 'messageReplyHeader', replyToMsgId: replyTo },
      fwdFrom: forwardedFrom ?? undefined,
    };
    if (chats.has(userId)) chats.get(userId).push(message);
    else chats.set(userId, [message]);
    return message;
  };

  const dialogOf = (userId) => ({
    _: 'dialog',
    peer: peerUser(userId),
    topMessage: lastOf(userId).id,
    readInboxMaxId: readUpTo.get(userId) ?? 0,
    readOutboxMaxId: 0,
    unreadCount: unreadIn(userId),
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
      // A chat whose every message was deleted drops out of the list, as on Telegram.
      const listed = [...chats.keys()].filter((userId) => historyOf(userId).length > 0);
      const page = offsetId === 0 ? listed.toSorted((a, b) => lastOf(b).id - lastOf(a).id) : [];
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
    // In a private chat Telegram confirms a sent message with this short update, which mtcute
    // rebuilds the message from.
    'messages.sendMessage': ({ peer, message, replyTo }) => {
      const sent = addMessage(peer.userId, message, { out: true, replyTo: replyTo?.replyToMsgId ?? null });
      return {
        _: 'updateShortSentMessage',
        out: true,
        id: sent.id,
        date: sent.date,
        pts: client.getNextPts(),
        ptsCount: 1,
      };
    },
    'messages.editMessage': ({ peer, id, message: text }) => {
      const edited = historyOf(peer.userId).find((message) => message.id === id);
      edited.message = text;
      edited.editDate = client.getNextDate();
      const update = { _: 'updateEditMessage', message: edited, pts: client.getNextPts(), ptsCount: 1 };
      return client.createStubUpdates({ updates: [update], peers: [peer.userId, SELF_ID] });
    },
    // No chat in the request: in private chats a message id is unique to the account. `revoke`
    // deletes it for the other side too.
    'messages.deleteMessages': ({ id: ids, revoke }) => {
      for (const [userId, history] of chats) {
        const gone = history.filter((message) => ids.includes(message.id));
        if (gone.length === 0) continue;
        chats.set(
          userId,
          history.filter((message) => !ids.includes(message.id)),
        );
        const log = deletions.get(userId) ?? [];
        deletions.set(userId, [...log, ...gone.map((message) => ({ message, forEveryone: Boolean(revoke) }))]);
      }
      return { _: 'messages.affectedMessages', pts: client.getNextPts(0, ids.length), ptsCount: ids.length };
    },
    // Telegram answers with a new message in the target chat for each one forwarded, carrying the
    // original's sender and date, unless `dropAuthor` asks for a plain copy.
    'messages.forwardMessages': ({ fromPeer, toPeer, id: ids, dropAuthor }) => {
      const originals = historyOf(fromPeer.userId).filter((message) => ids.includes(message.id));
      const updates = originals.map((original) => {
        const header = { _: 'messageFwdHeader', fromId: original.fromId, date: original.date };
        const forwardedFrom = dropAuthor ? null : header;
        const message = addMessage(toPeer.userId, original.message, { out: true, forwardedFrom });
        return { _: 'updateNewMessage', message, pts: client.getNextPts(), ptsCount: 1 };
      });
      const senders = originals.map((original) => original.fromId.userId);
      return client.createStubUpdates({ updates, peers: [toPeer.userId, SELF_ID, ...senders] });
    },
    'messages.readHistory': ({ peer, maxId }) => {
      markRead(peer.userId, maxId);
      return { _: 'messages.affectedMessages', pts: client.getNextPts(), ptsCount: 1 };
    },
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

    // `status` is a raw TL `UserStatus`, such as `{ _: 'userStatusOnline', expires }`.
    user: async ({ firstName, lastName, status }) => {
      const user = tlUser({ id: nextUserId++, firstName, lastName, status });
      users.set(user.id, user);
      await client.registerPeers(user);
      return user.id;
    },

    message: (userId, text, options) => void addMessage(userId, text, options),

    // The chat's deleted messages, in the order they went, and whether for the other side too.
    deleted: (userId) =>
      (deletions.get(userId) ?? []).map(({ message, forEveryone }) => ({ text: message.message, forEveryone })),

    // The chat as Telegram has it, oldest first: each message's text, whether the account sent it,
    // the text of the message it replies to, and whose message it is a forward of.
    history: (userId) => {
      const history = historyOf(userId);
      const textOf = (id) => history.find((message) => message.id === id)?.message ?? null;
      return history.map(({ message, out, replyTo, fwdFrom }) => ({
        text: message,
        out,
        replyTo: replyTo === undefined ? null : textOf(replyTo.replyToMsgId),
        forwardedFrom: fwdFrom === undefined ? null : users.get(fwdFrom.fromId.userId).firstName,
      }));
    },

    // Marks the chat read up to its newest message, as if read on another device.
    read: (userId) => markRead(userId),

    // The chat's unread count as Telegram has it: what the app has marked read, it has told Telegram.
    unreadCount: (userId) => unreadIn(userId),

    receive: (userId, text) => {
      const message = addMessage(userId, text);
      const update = { _: 'updateNewMessage', message, pts: client.getNextPts(), ptsCount: 1 };
      client.onServerUpdate.emit(client.createStubUpdates({ updates: [update], peers: [userId] }));
    },
  };
};

module.exports = { createTelegram };
