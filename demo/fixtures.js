'use strict';

// Fabricated Telegram data for the README screenshot. Nothing here comes from a real account.
//
// The shapes mimic mtcute's own objects, not tuigram's domain types, because the preload swaps
// the client underneath `src/4-messenger` and the real converters still run on top:
// `Message.from`, `Dialog.from` and `Media.from` in src/4-messenger/(common)/ read exactly the
// fields set below — nothing else needs to exist.

const fs = require('node:fs');
const path = require('node:path');

const bytes = (name) => new Uint8Array(fs.readFileSync(path.join(__dirname, name)));

// The ~40px inline preview travels inside a real message; the 320px one costs a download.
const STRIP = bytes('photo-strip.jpg');
const THUMB_320 = bytes('photo.jpg');
const THUMB_320_ID = 'demo-photo-320';

const me = { id: 1, displayName: 'me', type: 'user', isSelf: true };
const user = (id, displayName) => ({ id, displayName, type: 'user', isSelf: false });

const peers = {
  zelka: user(4301, 'Zelka Ombrin'),
  trest: user(4302, 'Trest Kavo'),
  vaneli: user(4210, 'Vaneli Prost'),
  mom: user(4211, 'Mom'),
  odry: user(4303, 'Odry Fenn'),
  miru: user(4304, 'Miru Tassek'),
  jarn: user(4212, 'Jarn Belko'),
  halva: user(4305, 'Halva Dorn'),
  brem: user(4306, 'Brem Ostal'),
  landlord: user(4213, 'Landlord'),
  dentist: user(4214, 'Dental Clinic'),
  quen: user(4215, 'Quen'),
  bot: user(4216, 'Deploy Bot'),
  dad: user(4217, 'Dad'),
  trainer: user(4218, 'Gym'),
  courier: user(4219, 'Delivery'),
  nissa: user(4307, 'Nissa Vorl'),
  kesp: user(4308, 'Kesp Ryvan'),
  orla: user(4309, 'Orla Tembin'),
  doval: user(4310, 'Doval Prek'),
  ryna: user(4311, 'Ryna Halvo'),
  uve: user(4312, 'Uve Grellan'),
};

const chat = (id, displayName, isGroup = false) => ({
  id,
  displayName,
  type: isGroup ? 'chat' : 'user',
  isGroup,
});

const chats = {
  devTeam: chat(-1001, 'Dev Team', true),
  vaneli: chat(4210, 'Vaneli Prost'),
  mom: chat(4211, 'Mom'),
  designGuild: chat(-1002, 'Design Guild', true),
  jarn: chat(4212, 'Jarn Belko'),
  zelka: chat(4301, 'Zelka Ombrin'),
  bot: chat(4216, 'Deploy Bot'),
  bookClub: chat(-1004, 'Book Club', true),
  saved: chat(1, 'Saved Messages'),
  trest: chat(4302, 'Trest Kavo'),
  wedding: chat(-1003, 'Wedding Sept 20', true),
  dentist: chat(4214, 'Dental Clinic'),
  quen: chat(4215, 'Quen'),
  uni: chat(-1006, 'Class of 2016', true),
  landlord: chat(4213, 'Landlord'),
  neighbours: chat(-1005, 'Staircase B', true),
  dad: chat(4217, 'Dad'),
  gym: chat(4218, 'Gym'),
  courier: chat(4219, 'Delivery'),
};

// A photo whose dimensions ride along with the message, so the bubble is sized before any
// pixels arrive — see src/6-ui/(common)/Media/size.js. 1280x853 lands on 40x13 cells.
const photo = {
  type: 'photo',
  width: 1280,
  height: 853,
  getThumbnail: (kind) => (kind === 'i' ? { location: STRIP } : { fileId: THUMB_320_ID }),
};

let lastId = 1000;

const nextId = () => {
  lastId += 1;
  return lastId;
};

const message = (where, sender, text, media = null) => ({
  id: nextId(),
  text,
  media,
  // Media.from falls back to `raw` when `media` is null, to tell "no media" from "unmodelled".
  raw: { _: 'message' },
  sender,
  chat: where,
});

/** Oldest-first; `historyOf` reverses, because Telegram returns the newest message first. */
const conversation = (where, lines) => lines.map(([sender, text, media]) => message(where, sender, text, media));

// tuigram's list preview is the message text verbatim — it does not prefix the sender the way
// the official clients do — so no line here carries a "name:" prefix of its own. Each chat's
// last line is also its preview, truncated to about 21 characters, so it opens with the joke.
const histories = new Map([
  [
    chats.devTeam.id,
    conversation(chats.devTeam, [
      [peers.zelka, 'are you seriously reading this in a terminal'],
      [me, 'it has vim keys and fifteen themes'],
      [peers.trest, 'he says that like it is a personality'],
      [peers.zelka, 'fine. here is the q3 chart, let us watch it try', photo],
      [
        me,
        'the stripped thumbnail drew before you finished sending it, and the 320px one ' +
          'caught up about a second later',
      ],
      [peers.trest, 'i was more worried about the line going off the cliff'],
      [me, 'one problem at a time'],
      [peers.zelka, 'this is the most effort anyone has ever put into avoiding a gui'],
    ]),
  ],
  [
    chats.vaneli.id,
    conversation(chats.vaneli, [
      [peers.vaneli, 'are we still on for tomorrow?'],
      [me, 'yes. 10am'],
      [peers.vaneli, 'you answered in four words again'],
      [me, 'the message box is one line at the bottom of a terminal, vaneli'],
      [peers.vaneli, 'that explains nothing but ok'],
    ]),
  ],
  [
    chats.mom.id,
    conversation(chats.mom, [
      [peers.mom, 'why is your screen always black'],
      [me, 'it is a terminal, mom'],
      [peers.mom, 'it looks like the computer is broken'],
      [peers.mom, 'call me when you fix it ❤'],
    ]),
  ],
  [
    chats.designGuild.id,
    conversation(chats.designGuild, [
      [peers.odry, 'new mockups are in the drive'],
      [peers.miru, 'did you open them in the terminal client again'],
      [me, 'it renders photos, i keep telling you'],
      [peers.odry, 'in what, forty columns?'],
      [peers.miru, 'he is about to say that is plenty'],
    ]),
  ],
  [
    chats.jarn.id,
    conversation(chats.jarn, [
      [peers.jarn, 'lol did you see that'],
      [peers.jarn, 'you are going to reply with one line and a full stop, are you not'],
    ]),
  ],
  [
    chats.saved.id,
    conversation(chats.saved, [
      [me, 'https://opentui.dev'],
      [me, 'bump the homebrew formula after tagging'],
      [me, 'stop rebinding keys and ship it'],
    ]),
  ],
  [
    chats.wedding.id,
    conversation(chats.wedding, [
      [peers.halva, 'final headcount by friday. chicken or fish'],
      [peers.brem, 'put me down for fish'],
      [me, 'i am reading this from a terminal btw'],
      [peers.brem, 'nobody asked'],
    ]),
  ],
  [
    chats.zelka.id,
    conversation(chats.zelka, [
      [peers.zelka, 'screenshot the client for the readme already'],
      [me, 'i am mocking the data first'],
      [peers.zelka, 'of course you are'],
    ]),
  ],
  [
    chats.bot.id,
    conversation(chats.bot, [
      [peers.bot, 'build 1841 passed in 4m 12s'],
      [peers.bot, 'build 1842 failed: flaky scroll test'],
      [peers.bot, 'build 1843 passed on retry, as tradition demands'],
    ]),
  ],
  [
    chats.bookClub.id,
    conversation(chats.bookClub, [
      [peers.nissa, 'did anyone actually finish it'],
      [peers.kesp, 'i started it'],
      [peers.nissa, 'you said that in march'],
    ]),
  ],
  [
    chats.trest.id,
    conversation(chats.trest, [
      [peers.trest, 'did you rebind о and л as well'],
      [me, 'cyrillic layout. i am not switching back and forth to scroll'],
      [peers.trest, 'you have a condition'],
    ]),
  ],
  [
    chats.dentist.id,
    conversation(chats.dentist, [
      [peers.dentist, 'reminder: tuesday at 14:00'],
      [peers.dentist, 'please do not reschedule a fourth time'],
    ]),
  ],
  [
    chats.quen.id,
    conversation(chats.quen, [
      [peers.quen, 'send me that photo'],
      [me, 'which one'],
      [peers.quen, 'the one you described to me in words for ten minutes'],
    ]),
  ],
  [
    chats.uni.id,
    conversation(chats.uni, [
      [peers.orla, 'ten years already. reunion?'],
      [peers.doval, 'who is organising it'],
      [peers.orla, 'not me, i only raise the topic annually'],
    ]),
  ],
  [
    chats.neighbours.id,
    conversation(chats.neighbours, [
      [peers.ryna, 'whose bike is in the stairwell'],
      [peers.uve, 'it has been there since june'],
      [peers.ryna, 'so it belongs to the building now. understood'],
    ]),
  ],
  [
    chats.dad.id,
    conversation(chats.dad, [
      [peers.dad, 'your mother says your computer is broken'],
      [me, 'it is not broken'],
      [peers.dad, 'i know. i told her you just like it that way'],
    ]),
  ],
  [
    chats.gym.id,
    conversation(chats.gym, [
      [peers.trainer, 'you missed monday'],
      [peers.trainer, 'and wednesday'],
    ]),
  ],
  [
    chats.courier.id,
    conversation(chats.courier, [
      [peers.courier, 'left at your door'],
      [peers.courier, 'the one with the sticker about no soliciting'],
    ]),
  ],
  [
    chats.landlord.id,
    conversation(chats.landlord, [
      [peers.landlord, 'the plumber comes tuesday between 9 and 12'],
      [me, 'thanks, i will be home'],
      [peers.landlord, 'he says the leak is above the desk with all the screens'],
    ]),
  ],
]);

const dialog = (where, { unreadCount = 0, isPinned = false, muted = false } = {}) => ({
  peer: { id: where.id, displayName: where.displayName },
  lastMessage: histories.get(where.id).at(-1),
  isPinned,
  unreadCount,
  isUnread: unreadCount > 0,
  raw: { notifySettings: { silent: muted } },
});

// The list order is the order Telegram would return: pinned first, then by date.
const dialogs = [
  dialog(chats.devTeam, { isPinned: true }),
  dialog(chats.vaneli),
  dialog(chats.mom, { unreadCount: 1 }),
  dialog(chats.designGuild, { unreadCount: 12 }),
  dialog(chats.jarn, { unreadCount: 2 }),
  dialog(chats.zelka),
  dialog(chats.bot, { unreadCount: 34, muted: true }),
  dialog(chats.bookClub, { unreadCount: 7 }),
  dialog(chats.saved),
  dialog(chats.trest),
  dialog(chats.wedding, { unreadCount: 5 }),
  dialog(chats.dentist, { unreadCount: 1 }),
  dialog(chats.quen),
  dialog(chats.uni, { unreadCount: 3 }),
  dialog(chats.landlord, { muted: true }),
  dialog(chats.neighbours, { unreadCount: 18, muted: true }),
  dialog(chats.dad),
  dialog(chats.gym, { unreadCount: 2, muted: true }),
  dialog(chats.courier, { unreadCount: 1 }),
];

/** Newest-first, the way `tg.getHistory` hands it over. */
const historyOf = (chatId) => (histories.get(chatId) ?? []).toReversed();

/** Drives the read/unread receipt: everything the demo account sent has been read. */
const lastReadOutgoing = (chatId) => {
  const outgoing = (histories.get(chatId) ?? []).filter(({ sender }) => sender.isSelf);
  return outgoing.at(-1)?.id ?? 0;
};

/** What `tg.sendText` echoes back, so typing in the prompt round-trips a real bubble. */
const sent = (chatId, text) => {
  const where = Object.values(chats).find(({ id }) => id === chatId) ?? chats.devTeam;
  const outgoing = message(where, me, text);
  histories.get(chatId)?.push(outgoing);
  return outgoing;
};

module.exports = { dialogs, historyOf, lastReadOutgoing, sent, THUMB_320, THUMB_320_ID };
