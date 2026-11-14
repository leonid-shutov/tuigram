'use strict';

// demo/fixtures.js as an account on the tests' fake Telegram (test/telegram.js).

const fs = require('node:fs');
const path = require('node:path');
const { createTelegram } = require('../test/telegram.js');
const fixtures = require('./fixtures.js');

// The photos a fixture line can attach, by name: the size as sent, and the file the fake serves for
// it. The aquarium is served whole, so a terminal that draws real pixels shows it sharp.
const photo = (width, height, file) => ({ width, height, thumb: fs.readFileSync(path.join(__dirname, file)) });
const PHOTOS = {
  chart: photo(1280, 853, 'photo.jpg'),
  aquarium: photo(1280, 1280, 'aquarium.jpg'),
};
const MINUTE = 60;
const DAY = 24 * 60 * MINUTE;

/** The account in demo/fixtures.js; the emojis it picks, by chat id; and the ids of its people (by
 * their key in fixtures.people) and chats (by title, or by the key of the other side).
 * `withhold` leaves out the last lines of the chats it names, by count: the GIF plays those live.
 * Unread lines among them are gone with them; the ones left are all read. */
const createAccount = async ({ withhold = {} } = {}) => {
  const telegram = await createTelegram({ name: 'Saved Messages' });
  const people = new Map([['me', telegram.self]]);
  for (const [key, name] of Object.entries(fixtures.people)) {
    const [firstName, ...rest] = name.split(' ');
    const online = fixtures.online.includes(key);
    people.set(key, await telegram.user({ firstName, lastName: rest.join(' ') || undefined, online }));
  }

  const emojis = {};
  const chats = new Map();
  const now = Math.floor(Date.now() / 1000);
  // Oldest chat first: the fake lists the chat with the newest message at the top.
  for (const [index, chat] of [...fixtures.chats.entries()].toReversed()) {
    const chatId = chat.title === undefined ? people.get(chat.with) : await telegram.group({ title: chat.title });
    const key = chat.title ?? chat.with;
    chats.set(key, chatId);
    const held = withhold[key] ?? 0;
    const lines = chat.lines.slice(0, chat.lines.length - held);
    const newest = now - MINUTE - index * 23 * MINUTE;
    const add = ([sender, text, media], line) =>
      telegram.message(chatId, text, {
        out: sender === 'me',
        from: people.get(sender),
        date: newest - (lines.length - 1 - line) * 4 * MINUTE - (line < (chat.yesterday ?? 0) ? DAY : 0),
        photo: PHOTOS[media] ?? null,
      });

    const read = lines.length - Math.max(0, (chat.unread ?? 0) - held);
    lines.slice(0, read).forEach(add);
    telegram.read(chatId);
    lines.slice(read).forEach((line, offset) => add(line, read + offset));
    telegram.seen(chatId);

    if (chat.pinned) telegram.pin(chatId);
    if (chat.muted) telegram.mute(chatId);
    if (chat.emoji !== undefined) emojis[chatId] = chat.emoji;
  }
  return { telegram, emojis, people, chats };
};

module.exports = { PHOTOS, createAccount };
