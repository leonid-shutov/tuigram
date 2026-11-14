'use strict';

// The GIF's scene (demo/record.js), played under TUIGRAM_DEMO_SCENE. The Family chat's news
// happens live: its last five lines are held back. When the recorder gives the cue, Sis, Mom and
// Dad send the first three, a moment apart; the recorder types the account's one; and once that is
// sent, Dad types for a moment and answers with the last.
//
// The cue is a file, named by TUIGRAM_DEMO_CUE, that the recorder creates once it is filming.
// Without one the family stays quiet. TUIGRAM_DEMO_NOTIFY lets the app's notifications through:
// the recorder sets it, as its D-Bus has a notification daemon of its own on the virtual display.
// Otherwise they would reach the desktop of whoever runs this, so they are silenced.

const fs = require('node:fs');
const path = require('node:path');
const fixtures = require('./fixtures.js');
const { PHOTOS } = require('./account.js');

const CHAT = 'Family';
const family = fixtures.chats.find((chat) => chat.title === CHAT);
const held = family.lines.slice(-5);
const news = held.slice(0, 3);
const [[, typed], [answerFrom, answer]] = held.slice(3);

/** The lines left out of the account, by chat. */
const withhold = { [CHAT]: held.length };

const NEWS_GAP = 1200;
const TYPES_AFTER = 700;
const ANSWERS_AFTER = 2400;
const POLL = 100;

/** Linux only: a no-op notify-send first on PATH. */
const silenceNotifications = (home) => {
  const bin = path.join(home, 'bin');
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(bin, 'notify-send'), '#!/bin/sh\n', { mode: 0o755 });
  process.env.PATH = `${bin}${path.delimiter}${process.env.PATH}`;
};

/** Runs `then` once `ready()` holds, checking every POLL ms. */
const once = (ready, then) => {
  const poll = setInterval(() => {
    if (!ready()) return;
    clearInterval(poll);
    then();
  }, POLL);
  poll.unref();
};

const later = (ms, action) => setTimeout(action, ms).unref();

/** @param {{ telegram: any, people: Map<string, number>, chats: Map<string, number>, home: string }} account */
const play = ({ telegram, people, chats, home }) => {
  if (!process.env.TUIGRAM_DEMO_NOTIFY) silenceNotifications(home);
  const chatId = chats.get(CHAT);
  const cue = process.env.TUIGRAM_DEMO_CUE;
  if (cue) {
    once(
      () => fs.existsSync(cue),
      () => {
        for (const [index, [from, text, media]] of news.entries()) {
          const photo = PHOTOS[media] ?? null;
          later(index * NEWS_GAP, () => telegram.receive(chatId, text, { from: people.get(from), photo }));
        }
      },
    );
  }

  const sent = () => telegram.history(chatId).filter((message) => message.out).length;
  const before = sent();
  once(
    () => sent() > before,
    () => {
      const from = people.get(answerFrom);
      later(TYPES_AFTER, () => telegram.typing(chatId, { from }));
      later(ANSWERS_AFTER, () => telegram.receive(chatId, answer, { from }));
    },
  );
};

module.exports = { CHAT, typed, withhold, play };
