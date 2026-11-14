'use strict';

const path = require('node:path');
const { Long, NodePlatform, TelegramClient } = require('../bin/mtcute.js');
const { NodeCryptoProvider } = require('@mtcute/node/utils.js');

// Imported by file: the package entry point only loads under vitest (docs/MTCUTE_BUGS.md).
const STUB = path.resolve(__dirname, '..', 'node_modules', '@mtcute', 'test', 'client.js');

const SELF_ID = 1;
const MAX_CALLS = 2000;
// Telegram's "forever": muted until the end of 32-bit time.
const FOREVER = 2 ** 31 - 1;
// The box a photo's 320px thumbnail ('m') fits in.
const THUMB_BOX = 320;

const peerUser = (userId) => ({ _: 'peerUser', userId });
// A chat id is a user's id for a private chat, or minus a basic group's id, as mtcute marks them.
const peerOf = (chatId) => (chatId > 0 ? peerUser(chatId) : { _: 'peerChat', chatId: -chatId });
const chatIdOf = (inputPeer) => {
  if (inputPeer._ === 'inputPeerSelf') return SELF_ID;
  if (inputPeer._ === 'inputPeerChat') return -inputPeer.chatId;
  return inputPeer.userId;
};

// `online` is online for the next hour; otherwise no status, which mtcute reads as long ago.
const tlUser = ({ id, firstName, lastName, self = false, online = false }) => ({
  _: 'user',
  id,
  self,
  accessHash: Long.fromNumber(id),
  firstName,
  lastName,
  status: online ? { _: 'userStatusOnline', expires: Math.floor(Date.now() / 1000) + 3600 } : undefined,
});

const tlGroup = ({ id, title, date }) => ({
  _: 'chat',
  id,
  title,
  participantsCount: 1,
  date,
  version: 1,
  photo: { _: 'chatPhotoEmpty' },
});

// The sizes Telegram lists for a photo of `width` x `height`: the 320px box the app downloads,
// and the full size it sizes the bubble by.
const tlPhoto = ({ id, width, height, thumb, date }) => {
  const scale = Math.min(1, THUMB_BOX / Math.max(width, height));
  return {
    _: 'messageMediaPhoto',
    photo: {
      _: 'photo',
      id: Long.fromNumber(id),
      accessHash: Long.fromNumber(id),
      fileReference: new Uint8Array(0),
      date,
      sizes: [
        { _: 'photoSize', type: 'm', w: Math.round(width * scale), h: Math.round(height * scale), size: thumb.length },
        { _: 'photoSize', type: 'y', w: width, h: height, size: thumb.length },
      ],
      dcId: 2,
    },
  };
};

/**
 * A fake Telegram account, faked at the wire under the real client (docs/TESTING.md). `name` is
 * the account's own first name, which Telegram also names the chat with yourself after.
 */
const createTelegram = async ({ name = 'Me' } = {}) => {
  const { StubTelegramClient } = await import(STUB);
  // Each option overrides a stub default that breaks on Node or drops updates (docs/MTCUTE_BUGS.md).
  const client = new StubTelegramClient({
    disableUpdates: false,
    crypto: new NodeCryptoProvider(),
    platform: new NodePlatform(),
  });

  const self = tlUser({ id: SELF_ID, firstName: name, self: true });
  const users = new Map([[SELF_ID, self]]);
  const groups = new Map();
  // Each chat's messages, oldest first; a chat is here once it has one.
  const chats = new Map();
  // Each chat's read position: the id of the newest message the account has read in it.
  const readUpTo = new Map();
  // The same, the other way: the newest of the account's own messages the other side has read.
  const seenUpTo = new Map();
  // Each chat's deleted messages, in the order they went: `{ message, forEveryone }`.
  const deletions = new Map();
  const pinned = new Set();
  const muted = new Set();
  // Each photo's 320px thumbnail, by photo id.
  const thumbs = new Map();
  const unanswered = [];
  let callCount = 0;
  let nextUserId = 100;
  // Apart from the users': mtcute caches peers by raw id, so a group would shadow the user with
  // its number, and that private chat would open onto the group (docs/MTCUTE_BUGS.md).
  let nextGroupId = 100_000;
  let nextPhotoId = 100;

  // Signed in, or mtcute drops every update (docs/MTCUTE_BUGS.md).
  await client.prepare();
  await client.storage.self.store({ userId: SELF_ID, isBot: false, isPremium: false, usernames: [] });
  // Known to the stub too, so an update about the account's own message can name its sender.
  await client.registerPeers(self);

  const peers = () => ({ chats: [...groups.values()], users: [...users.values()] });
  const historyOf = (chatId) => chats.get(chatId) ?? [];
  const lastOf = (chatId) => historyOf(chatId).at(-1);
  const unreadIn = (chatId) =>
    historyOf(chatId).filter((message) => !message.out && message.id > (readUpTo.get(chatId) ?? 0)).length;
  // A `maxId` of 0 reads the whole chat, as on Telegram.
  const markRead = (chatId, maxId = 0) => {
    const newest = lastOf(chatId)?.id ?? 0;
    readUpTo.set(chatId, maxId === 0 ? newest : maxId);
  };

  // `from` is who sent it, when that isn't the other side of a private chat: a group needs one.
  // `replyTo` is the id of the message it replies to, in the same chat.
  // `forwardedFrom` is the original's header, when it is a forwarded copy.
  // `date` is when it was sent, in seconds; now by default.
  // `photo` attaches one, as `{ width, height, thumb }`: its size as sent, and the 320px JPEG.
  const addMessage = (chatId, text, options = {}) => {
    const { out = false, from = chatId, replyTo = null, forwardedFrom = null, photo = null } = options;
    const date = options.date ?? client.getNextDate();
    const message = {
      _: 'message',
      id: client.getNextMessageId(),
      out,
      peerId: peerOf(chatId),
      fromId: peerUser(out ? SELF_ID : from),
      date,
      message: text,
      replyTo: replyTo === null ? undefined : { _: 'messageReplyHeader', replyToMsgId: replyTo },
      fwdFrom: forwardedFrom ?? undefined,
    };
    if (photo !== null) {
      const id = nextPhotoId++;
      thumbs.set(id, photo.thumb);
      message.media = tlPhoto({ id, date, ...photo });
    }
    if (chats.has(chatId)) chats.get(chatId).push(message);
    else chats.set(chatId, [message]);
    return message;
  };

  const dialogOf = (chatId) => ({
    _: 'dialog',
    pinned: pinned.has(chatId),
    peer: peerOf(chatId),
    topMessage: lastOf(chatId).id,
    readInboxMaxId: readUpTo.get(chatId) ?? 0,
    readOutboxMaxId: seenUpTo.get(chatId) ?? 0,
    unreadCount: unreadIn(chatId),
    unreadMentionsCount: 0,
    unreadReactionsCount: 0,
    notifySettings: { _: 'peerNotifySettings', muteUntil: muted.has(chatId) ? FOREVER : 0 },
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
    // Every dialog fits on the first page, so any later page (one with an offset) is empty. The
    // archive (folder 1) is always empty. Pinned chats come first, then the newest.
    'messages.getDialogs': ({ offsetId, folderId }) => {
      // A chat whose every message was deleted drops out of the list, as on Telegram.
      const listed = [...chats.keys()].filter((chatId) => historyOf(chatId).length > 0);
      const order = (a, b) => pinned.has(b) - pinned.has(a) || lastOf(b).id - lastOf(a).id;
      const page = offsetId === 0 && folderId !== 1 ? listed.toSorted(order) : [];
      return { _: 'messages.dialogs', dialogs: page.map(dialogOf), messages: page.map(lastOf), ...peers() };
    },
    // Newest first, below `offsetId` when there is one, `limit` at a time.
    'messages.getHistory': ({ peer, offsetId, limit }) => {
      const history = historyOf(chatIdOf(peer));
      const below = offsetId === 0 ? history : history.filter((message) => message.id < offsetId);
      return { _: 'messages.messages', messages: below.toReversed().slice(0, limit), ...peers() };
    },
    // In a private chat Telegram confirms a sent message with a short update, which mtcute rebuilds
    // the message from; in a group, with the message itself and the id it got for `randomId`.
    'messages.sendMessage': ({ peer, message, replyTo, randomId }) => {
      const chatId = chatIdOf(peer);
      const sent = addMessage(chatId, message, { out: true, replyTo: replyTo?.replyToMsgId ?? null });
      const pts = client.getNextPts();
      if (chatId > 0) return { _: 'updateShortSentMessage', out: true, id: sent.id, date: sent.date, pts, ptsCount: 1 };
      const updates = [
        { _: 'updateMessageID', id: sent.id, randomId },
        { _: 'updateNewMessage', message: sent, pts, ptsCount: 1 },
      ];
      return client.createStubUpdates({ updates, peers: [chatId, SELF_ID] });
    },
    'messages.editMessage': ({ peer, id, message: text }) => {
      const chatId = chatIdOf(peer);
      const edited = historyOf(chatId).find((message) => message.id === id);
      edited.message = text;
      edited.editDate = client.getNextDate();
      const update = { _: 'updateEditMessage', message: edited, pts: client.getNextPts(), ptsCount: 1 };
      return client.createStubUpdates({ updates: [update], peers: [chatId, SELF_ID] });
    },
    // No chat in the request: in private chats and basic groups a message id is unique to the
    // account. `revoke` deletes it for the other side too.
    'messages.deleteMessages': ({ id: ids, revoke }) => {
      for (const [chatId, history] of chats) {
        const gone = history.filter((message) => ids.includes(message.id));
        if (gone.length === 0) continue;
        chats.set(
          chatId,
          history.filter((message) => !ids.includes(message.id)),
        );
        const log = deletions.get(chatId) ?? [];
        deletions.set(chatId, [...log, ...gone.map((message) => ({ message, forEveryone: Boolean(revoke) }))]);
      }
      return { _: 'messages.affectedMessages', pts: client.getNextPts(0, ids.length), ptsCount: ids.length };
    },
    // Telegram answers with a new message in the target chat for each one forwarded, carrying the
    // original's sender and date, unless `dropAuthor` asks for a plain copy.
    'messages.forwardMessages': ({ fromPeer, toPeer, id: ids, dropAuthor }) => {
      const target = chatIdOf(toPeer);
      const originals = historyOf(chatIdOf(fromPeer)).filter((message) => ids.includes(message.id));
      const updates = originals.map((original) => {
        const header = { _: 'messageFwdHeader', fromId: original.fromId, date: original.date };
        const forwardedFrom = dropAuthor ? null : header;
        const message = addMessage(target, original.message, { out: true, forwardedFrom });
        return { _: 'updateNewMessage', message, pts: client.getNextPts(), ptsCount: 1 };
      });
      const senders = originals.map((original) => original.fromId.userId);
      return client.createStubUpdates({ updates, peers: [target, SELF_ID, ...senders] });
    },
    'messages.readHistory': ({ peer, maxId }) => {
      markRead(chatIdOf(peer), maxId);
      return { _: 'messages.affectedMessages', pts: client.getNextPts(), ptsCount: 1 };
    },
    // Only photos' 320px thumbnails are on file, in parts of `limit` bytes.
    'upload.getFile': ({ location, offset, limit }) => {
      const thumb = location._ === 'inputPhotoFileLocation' ? thumbs.get(location.id.toNumber()) : undefined;
      if (thumb === undefined || location.thumbSize !== 'm') throw new Error('fake Telegram: no such file');
      const bytes = thumb.subarray(offset, offset + limit);
      return { _: 'upload.file', type: { _: 'storage.fileJpeg' }, mtime: client.getNextDate(), bytes };
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
    /** The account as a world's `telegram` (bin/world.js): mtcute's client, on the fake. */
    facet: {
      // src/ passes the options for a real connection (key, session file, proxy); a client on
      // the fake needs none of them.
      Client: class extends TelegramClient {
        constructor() {
          super({ client });
        }
      },
    },
    unanswered,

    /** The chat with yourself: Saved Messages. */
    self: SELF_ID,

    user: async ({ firstName, lastName, online = false }) => {
      const user = tlUser({ id: nextUserId++, firstName, lastName, online });
      users.set(user.id, user);
      await client.registerPeers(user);
      return user.id;
    },

    // A basic group. Resolves to its chat id. Who is in it isn't tracked: anyone can post.
    group: async ({ title }) => {
      const group = tlGroup({ id: nextGroupId++, title, date: client.getNextDate() });
      groups.set(group.id, group);
      await client.registerPeers(group);
      return -group.id;
    },

    message: (chatId, text, options) => void addMessage(chatId, text, options),

    pin: (chatId) => void pinned.add(chatId),
    mute: (chatId) => void muted.add(chatId),

    // The chat's deleted messages, in the order they went, and whether for the other side too.
    deleted: (chatId) =>
      (deletions.get(chatId) ?? []).map(({ message, forEveryone }) => ({ text: message.message, forEveryone })),

    // The chat as Telegram has it, oldest first: each message's text, whether the account sent it,
    // the text of the message it replies to, and whose message it is a forward of.
    history: (chatId) => {
      const history = historyOf(chatId);
      const textOf = (id) => history.find((message) => message.id === id)?.message ?? null;
      return history.map(({ message, out, replyTo, fwdFrom }) => ({
        text: message,
        out,
        replyTo: replyTo === undefined ? null : textOf(replyTo.replyToMsgId),
        forwardedFrom: fwdFrom === undefined ? null : users.get(fwdFrom.fromId.userId).firstName,
      }));
    },

    // Marks the chat read up to its newest message, as if read on another device.
    read: (chatId) => markRead(chatId),

    // The other side has read the chat up to its newest message.
    seen: (chatId) => void seenUpTo.set(chatId, lastOf(chatId)?.id ?? 0),

    // The chat's unread count as Telegram has it: what the app has marked read, it has told Telegram.
    unreadCount: (chatId) => unreadIn(chatId),

    // `photo` attaches one, as for `message`.
    receive: (chatId, text, { from = chatId, photo = null } = {}) => {
      const message = addMessage(chatId, text, { from, photo });
      const update = { _: 'updateNewMessage', message, pts: client.getNextPts(), ptsCount: 1 };
      const peers = [...new Set([chatId, from])];
      client.onServerUpdate.emit(client.createStubUpdates({ updates: [update], peers }));
    },

    // `from` starts typing in the chat; their next message, or a quiet spell, ends it.
    typing: (chatId, { from = chatId } = {}) => {
      const action = { _: 'sendMessageTypingAction' };
      const update =
        chatId > 0
          ? { _: 'updateUserTyping', userId: from, action }
          : { _: 'updateChatUserTyping', chatId: -chatId, fromId: peerUser(from), action };
      const peers = [...new Set([chatId, from])];
      client.onServerUpdate.emit(client.createStubUpdates({ updates: [update], peers }));
    },
  };
};

module.exports = { createTelegram };
