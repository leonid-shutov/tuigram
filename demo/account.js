'use strict';

// demo/fixtures.js as an account on the tests' fake Telegram (test/telegram.js).

const fs = require('node:fs');
const path = require('node:path');
const { createTelegram } = require('../test/telegram.js');
const fixtures = require('./fixtures.js');

const PHOTO = { width: 1280, height: 853, thumb: fs.readFileSync(path.join(__dirname, 'photo.jpg')) };
const MINUTE = 60;

/** The account in demo/fixtures.js, and the emojis it picks, by chat id. */
const createAccount = async () => {
  const telegram = await createTelegram({ name: 'Saved Messages' });
  const people = new Map([['me', telegram.self]]);
  for (const [key, name] of Object.entries(fixtures.people)) {
    const [firstName, ...rest] = name.split(' ');
    people.set(key, await telegram.user({ firstName, lastName: rest.join(' ') || undefined }));
  }

  const emojis = {};
  const now = Math.floor(Date.now() / 1000);
  // Oldest chat first: the fake lists the chat with the newest message at the top.
  for (const [index, chat] of [...fixtures.chats.entries()].toReversed()) {
    const chatId = chat.title === undefined ? people.get(chat.with) : await telegram.group({ title: chat.title });
    const newest = now - MINUTE - index * 23 * MINUTE;
    const add = ([sender, text, media], line) =>
      telegram.message(chatId, text, {
        out: sender === 'me',
        from: people.get(sender),
        date: newest - (chat.lines.length - 1 - line) * 4 * MINUTE,
        photo: media === 'photo' ? PHOTO : null,
      });

    const read = chat.lines.length - (chat.unread ?? 0);
    chat.lines.slice(0, read).forEach(add);
    telegram.read(chatId);
    chat.lines.slice(read).forEach((line, offset) => add(line, read + offset));
    telegram.seen(chatId);

    if (chat.pinned) telegram.pin(chatId);
    if (chat.muted) telegram.mute(chatId);
    if (chat.emoji !== undefined) emojis[chatId] = chat.emoji;
  }
  return { telegram, emojis };
};

module.exports = { createAccount };
