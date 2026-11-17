# Testing

Every test boots the whole app, as `bin/tuigram.js` would, in a test world: a headless terminal,
a fake Telegram account, and a fresh home directory. It then drives the app with key presses and
Telegram events, and checks what a user, or the system, would see. Why it is built this way, and
what was ruled out, is in
[`docs/decisions/0002-integration-tests-in-a-test-world.md`](decisions/0002-integration-tests-in-a-test-world.md).

## Running

```sh
npm test                                   # every test/**/*.test.js
node --experimental-ffi --disable-warning=ExperimentalWarning --test test/chat.test.js
node --experimental-ffi --disable-warning=ExperimentalWarning --test --test-name-pattern='notifies' test/chat.test.js
```

opentui's renderer talks to its native backend through `node:ffi`, so plain `node --test` fails;
`npm test` passes the flag. Each test file runs in its own process.

## What's where

| File               | What it is                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `bin/world.js`     | The real world: opentui's renderer, mtcute's `TelegramClient`, `child_process.spawn`, `https.get`.                    |
| `bin/context.js`   | The sandbox's context, built the same way for the app and the tests.                                                  |
| `test/world.js`    | The test world, same shape: the headless renderer, a client on the fake Telegram, and recorders for spawns and HTTPS. |
| `test/telegram.js` | The fake Telegram account: users, chats, and the server's answers.                                                    |
| `test/app.js`      | `boot()`: the app in a test world, and the handle a test drives it with.                                              |
| `test/*.test.js`   | The tests.                                                                                                            |

## A test

```js
const assert = require('node:assert');
const { it, afterEach } = require('node:test');
const { createTelegram } = require('./telegram.js');
const { boot } = require('./app.js');

let telegram;
let app;

afterEach(async () => {
  await app.stop();
  assert.deepStrictEqual(telegram.unanswered, []);
});

it('notifies about a message arriving in another chat', async () => {
  // 1. The account as it is when the app starts.
  telegram = await createTelegram();
  const ann = await telegram.user({ firstName: 'Ann' });
  const bob = await telegram.user({ firstName: 'Bob' });
  telegram.message(bob, 'lunch tomorrow?');
  telegram.message(ann, 'hey!');
  telegram.message(ann, 'see you at 5'); // the newest message: Ann's chat is first in the list

  // 2. The app, started on it, with Ann's chat open at its first unread message.
  app = await boot({ telegram });
  await app.openFirstChat({ selected: 'hey!' });

  // 3. What Telegram pushes, or what the user does.
  telegram.receive(bob, 'still on?');

  // 4. What they see, and what happened outside the app.
  await app.waitForText('still on?');
  assert.deepStrictEqual(app.spawned, [{ cmd: 'notify-send', args: ['--app-name=tuigram', 'Bob', 'still on?'] }]);
});
```

`test/chat.test.js` sets up the account in a `beforeEach` for a whole `describe`; either way
works. Write the setup out in each `beforeEach`, call by call, rather than through a helper that
takes the messages as data: one test's setup should read on its own. Which chat `openFirstChat`
opens follows from the order the messages were added in, so say so on the line that decides it.

## Setting up the account: `createTelegram()`

`createTelegram()` resolves to a fake account signed in as "Me" (user id 1). Build what the app
should find on startup before calling `boot`:

| Call                                            | Effect                                                                                                      |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `await telegram.user({ firstName, lastName })`  | Someone the account knows. Resolves to their user id.                                                       |
| `telegram.message(userId, text)`                | A message already in the chat with them, from them. No update is sent.                                      |
| `telegram.message(userId, text, { out: true })` | The same, sent by the account.                                                                              |
| `telegram.read(userId)`                         | Marks the chat read up to its newest message, as if read on another device. Messages are unread until then. |

While the app runs:

| Call                             | Effect                                                                                                                                                                                                                                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `telegram.receive(userId, text)` | A message from them arriving now, pushed the way Telegram pushes one.                                                                                                                                                                                                       |
| `telegram.history(userId)`       | The chat as Telegram has it, oldest first, as `{ text, out, replyTo, forwardedFrom }`: whether the account sent it, the text of the message it replies to, and the first name of whoever's message it is a forward of. A message the app sent is here once Telegram has it. |
| `telegram.deleted(userId)`       | The chat's deleted messages, in the order they went, as `{ text, forEveryone }`: whether they went for the other side too.                                                                                                                                                  |
| `telegram.unreadCount(userId)`   | The chat's unread count as Telegram has it: it drops when the app marks the chat read.                                                                                                                                                                                      |
| `telegram.unanswered`            | The methods the app called that the fake has no answer for.                                                                                                                                                                                                                 |

The fake doesn't record the calls the app makes, on purpose: see "Asserting" below.

Chats are private chats only, for now: no groups, channels, media or folders.

## Driving the app: `boot()`

`boot({ telegram, width = 80, height = 24, env = {} })` starts the app and resolves once it has
loaded. It rejects, with everything the app logged, if the app exits or crashes while starting.
`env` adds to, or overrides, the environment the app sees. That environment already has every
`XDG_*` directory pointing into the test's own home, and an app key in `TUIGRAM_API_ID` and
`TUIGRAM_API_HASH`, so the setup form is skipped.

The handle it resolves to:

| Member                                  | What it does                                                                                                                                                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `await app.waitForText(text)`           | Resolves to the frame once it contains `text`. Throws after 3 s, with the last frame and the log.                                                                                                            |
| `await app.waitForFrame(predicate)`     | The same, for any condition on the frame.                                                                                                                                                                    |
| `await app.waitFor(condition)`          | Waits for something that isn't on screen, such as `telegram.unreadCount(ann) === 0`.                                                                                                                         |
| `await app.focused()`                   | The text in the focused element. In a chat, that's the selected message, as written (not as wrapped on screen).                                                                                              |
| `await app.waitForFocused(text)`        | Waits until the focused element shows `text`: in a chat, until that message is the selected one.                                                                                                             |
| `await app.openFirstChat({ selected })` | Opens the first chat in the chat list with Enter and waits until `selected` is the selected message: the chat's first unread message, or else its newest. The first chat is the one with the newest message. |
| `await app.selectedChat()`              | The chat list's selected row, its first line as shown: emoji, name, unread count. Match the name with `/\bAnn\b/`.                                                                                           |
| `await app.frame()`                     | The screen now, as text.                                                                                                                                                                                     |
| `app.press(key, modifiers)`             | One key: a character (`'j'`), or a name from opentui's `KeyCodes` (`'RETURN'`, `'ESCAPE'`, `'TAB'`, `'ARROW_UP'`, …). `modifiers` is `{ ctrl, shift, meta }`.                                                |
| `await app.type(text)`                  | Types `text`, one key at a time.                                                                                                                                                                             |
| `app.spawned`                           | The programs the app started, as `{ cmd, args }`. None of them ran.                                                                                                                                          |
| `app.fetched`                           | The URLs it requested. Every request failed, as with no network.                                                                                                                                             |
| `app.logs`                              | What the app logged, wrote to stderr, or reported as a crash.                                                                                                                                                |
| `app.sandbox`                           | The app's globals (`store`, `ui`, `actions`, …). Prefer what's on screen.                                                                                                                                    |
| `await app.stop()`                      | Quits the way the app does (`Crash.exit`), waits for it, deletes its home.                                                                                                                                   |

Always `stop()` the app, in an `afterEach`, so its renderer and Telegram client are closed and
its home is deleted.

## Asserting

In order of preference:

1. **The frame.** It is what the user sees. Wait for it with `waitForText` or `waitForFrame`,
   never with a fixed sleep: Telegram's answers, mtcute's updates and the renderer all take a
   few turns of the event loop.
2. **The fake Telegram's state**, for an effect on Telegram the screen doesn't show: a chat
   marked read, a message sent. Check the outcome on the fake, not the request that caused it,
   the way a localstack test checks that the object landed in S3, not that `PutObject` was
   called. Which method the app used and how it filled the request are mtcute's business; a test
   that pins them down breaks when they change and the behaviour doesn't. When a test needs to
   see some state, give the fake an accessor for it (and make the call that changes it update
   it; see below).
3. **What left the app:** `app.spawned` and `app.fetched`, the programs it started and the URLs
   it requested.
4. **`app.sandbox`**, only when the behaviour has no visible effect at all.

A frame that only the right request could have produced already covers that request. Opening a
chat shows `'hey!'` only if the app asked for Ann's history: the fake would have answered a
request for Bob's with Bob's messages.

`frame.indexOf(...)` comparisons have to allow for text appearing in more than one place. The
open chat's name is in its title on the first line, before anything in the chat list.

## Reading the selection

A selection is shown by color, which a text frame doesn't keep, so `app.focused()` and
`app.selectedChat()` read it from opentui's tree of elements instead, the way a web test asks
the DOM what has focus rather than looking at pixels:

- **In a chat, the selected message is the focused bubble.** The app gives the selected bubble
  opentui's focus, and opentui draws a focused element in its focus color. `app.focused()` takes
  the renderer's focused element and joins the text of its visible text elements. The chat pane
  has to have focus: while it doesn't, no bubble is selected, on screen or here.
- **In the chat list, the selected row is the list's selected option.** `app.selectedChat()`
  finds the list by the id the app gives it, `dialogsList`, and returns the selected option's
  first line. If the id ever changes, it fails saying so.

What this leaves out is the drawing: that the focused bubble's border and the selected row's
background really are drawn in a distinct color. That is opentui's job, and every built-in theme
draws both distinctly. Reading the drawn cells' colors instead was tried and dropped: 12 of the
15 built-in themes have no `selected` color of their own and fall back to the accent color,
which the focused chat pane's border uses too, and reading cells needs every wide character's
width to keep columns straight.

## Teaching the fake a new method

When the app starts calling a Telegram method the fake does not know, the call fails with
`fake Telegram has no answer for <method>`, the method lands in `telegram.unanswered`, and the
`afterEach` check fails the test. Add an answer to `answers` in `test/telegram.js`:

- **Answer the way Telegram would, from the fake's own state.** Don't return a fixed value: the
  next test will ask a different question.
- **Honour paging.** Look at `offsetId`, `limit` and similar fields, and return an empty page
  past the end. mtcute's `iterDialogs` stops only on an empty page, so an answer that ignores its
  offset sends them round forever. Past 2000 calls the fake rejects every call, which ends the loop.
- **Get the shapes from the schema.** Telegram's types are declared in
  `node_modules/@mtcute/core/tl/index.d.ts`: grep for `_: 'messages.getHistory'` for a request's
  fields, and for `'messages.getHistory':` for the type it returns. Telegram documents every
  method at `https://core.telegram.org/method/<name>`.
- **A call that changes state on the server changes the fake's state too**, so later answers
  agree with it and tests can check it: a sent message joins the chat's history, a read moves the
  chat's read position. It also returns its new `pts`, from `client.getNextPts()`, as
  `messages.readHistory` does. mtcute uses it to keep its update sequence straight.

## Gotchas

- **Values from inside the app belong to another realm.** The app runs in a `vm` context, so its
  arrays and objects fail `assert.deepStrictEqual` against the test's own, even when they look
  identical. Copy them out first (`[...array]`, `Array.from`, `{ ...object }`), or compare with
  `assert.deepEqual`. `test/world.js` already copies what it records.
- **`process.exit` doesn't stop the app's code.** In a test it ends the app, so `stop()` and
  `boot()` notice, but unlike the real one it returns, and whatever follows the call still runs.
  Don't look at the app after it has exited. It does run the app's `exit` listeners first, as the
  real one does: that is where `Crash.hard` writes its report, so a crash still shows in the log.
- **Text on screen can be in more than one place.** A chat's last message is also its preview in
  the chat list, so `waitForText` on it can return before the chat itself has loaded, and keys
  pressed next go to an empty chat. To open a chat, use `app.openFirstChat({ selected })`, which
  waits for the message to be the selected one; after that, `app.waitForFocused(text)` does the
  same for any message.
- **Nothing is spawned.** A test that opens a file, a link or the editor sees the command in
  `app.spawned`, and the program "exits" with 0 on the next turn.
- **The headless renderer is not a real terminal.** A few timing problems only show up in a real
  one (Textarea's `onContentChange` arriving a key late is one). Those need a manual run.
- **`@mtcute/test` is imported by file path** (`test/telegram.js`), because its entry point only
  loads under vitest. `docs/MTCUTE_BUGS.md` has the details, and what else the stub needs to
  deliver updates at all.
