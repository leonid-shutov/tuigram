'use strict';

// Fabricated Telegram data for the README screenshot. Nothing here comes from a real account.
// demo/run.js builds it on the tests' fake Telegram (test/telegram.js).

const people = {
  zelka: 'Zelka Ombrin',
  trest: 'Trest Kavo',
  vaneli: 'Vaneli Prost',
  mom: 'Mom',
  odry: 'Odry Fenn',
  miru: 'Miru Tassek',
  jarn: 'Jarn Belko',
  halva: 'Halva Dorn',
  brem: 'Brem Ostal',
  landlord: 'Landlord',
  dentist: 'Dental Clinic',
  quen: 'Quen',
  bot: 'Deploy Bot',
  dad: 'Dad',
  trainer: 'Gym',
  courier: 'Delivery',
  nissa: 'Nissa Vorl',
  kesp: 'Kesp Ryvan',
  orla: 'Orla Tembin',
  doval: 'Doval Prek',
  ryna: 'Ryna Halvo',
  uve: 'Uve Grellan',
};

// The sender `me` is the account itself; `photo` attaches demo/photo.jpg (1280x853 as sent).
// tuigram's list preview is the last message's text verbatim, so each chat ends on its joke.
//
// The order is the chat list's, top to bottom: the first chat is the newest (or pinned).
// `with` names the other side of a private chat ('me': Saved Messages); a group has a `title`
// instead. `emoji` is the chat's glyph as if picked with `e`; without one the app assigns its own.
// `unread` is how many of the last lines the account hasn't read; the other side has read all of
// the account's own.
const chats = [
  {
    title: 'Dev Team',
    emoji: '📊',
    pinned: true,
    lines: [
      ['zelka', 'are you seriously reading this in a terminal'],
      ['me', 'it has vim keys and fifteen themes'],
      ['trest', 'he says that like it is a personality'],
      ['zelka', 'fine. here is the q3 chart, let us watch it try', 'photo'],
      [
        'me',
        'the stripped thumbnail drew before you finished sending it, and the 320px one ' +
          'caught up about a second later',
      ],
      ['trest', 'i was more worried about the line going off the cliff'],
      ['me', 'one problem at a time'],
      ['zelka', 'this is the most effort anyone has ever put into avoiding a gui'],
    ],
  },
  {
    with: 'vaneli',
    lines: [
      ['vaneli', 'are we still on for tomorrow?'],
      ['me', 'yes. 10am'],
      ['vaneli', 'you answered in four words again'],
      ['me', 'the message box is one line at the bottom of a terminal, vaneli'],
      ['vaneli', 'that explains nothing but ok'],
    ],
  },
  {
    with: 'mom',
    emoji: '🐞',
    unread: 1,
    lines: [
      ['mom', 'why is your screen always black'],
      ['me', 'it is a terminal, mom'],
      ['mom', 'it looks like the computer is broken'],
      ['mom', 'call me when you fix it ❤'],
    ],
  },
  {
    title: 'Design Guild',
    emoji: '📗',
    unread: 2,
    lines: [
      ['odry', 'new mockups are in the drive'],
      ['miru', 'did you open them in the terminal client again'],
      ['me', 'it renders photos, i keep telling you'],
      ['odry', 'in what, forty columns?'],
      ['miru', 'he is about to say that is plenty'],
    ],
  },
  {
    with: 'jarn',
    emoji: '🌹',
    unread: 2,
    lines: [
      ['jarn', 'lol did you see that'],
      ['jarn', 'you are going to reply with one line and a full stop, are you not'],
    ],
  },
  {
    with: 'zelka',
    emoji: '🍬',
    lines: [
      ['zelka', 'screenshot the client for the readme already'],
      ['me', 'i am mocking the data first'],
      ['zelka', 'of course you are'],
    ],
  },
  {
    with: 'bot',
    emoji: '🐝',
    unread: 3,
    muted: true,
    lines: [
      ['bot', 'build 1841 passed in 4m 12s'],
      ['bot', 'build 1842 failed: flaky scroll test'],
      ['bot', 'build 1843 passed on retry, as tradition demands'],
    ],
  },
  {
    title: 'Book Club',
    emoji: '🍸',
    unread: 3,
    lines: [
      ['nissa', 'did anyone actually finish it'],
      ['kesp', 'i started it'],
      ['nissa', 'you said that in march'],
    ],
  },
  {
    with: 'me',
    emoji: '🏉',
    lines: [
      ['me', 'https://opentui.dev'],
      ['me', 'bump the homebrew formula after tagging'],
      ['me', 'stop rebinding keys and ship it'],
    ],
  },
  {
    with: 'trest',
    emoji: '💺',
    lines: [
      ['trest', 'did you rebind о and л as well'],
      ['me', 'cyrillic layout. i am not switching back and forth to scroll'],
      ['trest', 'you have a condition'],
    ],
  },
  {
    title: 'Wedding Sept 20',
    emoji: '🍷',
    lines: [
      ['halva', 'final headcount by friday. chicken or fish'],
      ['brem', 'put me down for fish'],
      ['me', 'i am reading this from a terminal btw'],
      ['brem', 'nobody asked'],
    ],
  },
  {
    with: 'dentist',
    emoji: '🎺',
    unread: 1,
    lines: [
      ['dentist', 'reminder: tuesday at 14:00'],
      ['dentist', 'please do not reschedule a fourth time'],
    ],
  },
  {
    with: 'quen',
    emoji: '🚐',
    lines: [
      ['quen', 'send me that photo'],
      ['me', 'which one'],
      ['quen', 'the one you described to me in words for ten minutes'],
    ],
  },
  {
    title: 'Class of 2016',
    emoji: '🔱',
    unread: 3,
    lines: [
      ['orla', 'ten years already. reunion?'],
      ['doval', 'who is organising it'],
      ['orla', 'not me, i only raise the topic annually'],
    ],
  },
  {
    with: 'landlord',
    emoji: '🎃',
    muted: true,
    lines: [
      ['landlord', 'the plumber comes tuesday between 9 and 12'],
      ['me', 'thanks, i will be home'],
      ['landlord', 'he says the leak is above the desk with all the screens'],
    ],
  },
  {
    title: 'Staircase B',
    emoji: '🌲',
    unread: 3,
    muted: true,
    lines: [
      ['ryna', 'whose bike is in the stairwell'],
      ['uve', 'it has been there since june'],
      ['ryna', 'so it belongs to the building now. understood'],
    ],
  },
  {
    with: 'dad',
    emoji: '🍖',
    lines: [
      ['dad', 'your mother says your computer is broken'],
      ['me', 'it is not broken'],
      ['dad', 'i know. i told her you just like it that way'],
    ],
  },
  {
    with: 'trainer',
    emoji: '🐟',
    unread: 2,
    muted: true,
    lines: [
      ['trainer', 'you missed monday'],
      ['trainer', 'and wednesday'],
    ],
  },
  {
    with: 'courier',
    emoji: '🍙',
    unread: 1,
    lines: [
      ['courier', 'left at your door'],
      ['courier', 'the one with the sticker about no soliciting'],
    ],
  },
];

module.exports = { people, chats };
