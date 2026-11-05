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
  telegram.message(ann, 'see you at 5'); // the newest: Ann's chat is first, and selected

  // 2. The app, started on it.
  app = await boot({ telegram });

  // 3. What the user does, and what Telegram pushes.
  await app.waitForText('Ann');
  app.press('RETURN');
  await app.waitForText('hey!'); // only in the open chat: the list shows each chat's last message
  telegram.receive(bob, 'still on?');

  // 4. What they see, and what happened outside the app.
  await app.waitForText('still on?');
  assert.deepStrictEqual(app.spawned, [{ cmd: 'notify-send', args: ['--app-name=tuigram', 'Bob', 'still on?'] }]);
});
```

`test/chat.test.js` sets up the account in a `beforeEach` for a whole `describe`; either way
works.

## Setting up the account: `createTelegram()`

`createTelegram()` resolves to a fake account signed in as "Me" (user id 1). Build what the app
should find on startup before calling `boot`:

| Call                                            | Effect                                                                 |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| `await telegram.user({ firstName, lastName })`  | Someone the account knows. Resolves to their user id.                  |
| `telegram.message(userId, text)`                | A message already in the chat with them, from them. No update is sent. |
| `telegram.message(userId, text, { out: true })` | The same, sent by the account.                                         |

While the app runs:

| Call                             | Effect                                                                |
| -------------------------------- | --------------------------------------------------------------------- |
| `telegram.receive(userId, text)` | A message from them arriving now, pushed the way Telegram pushes one. |
| `telegram.unanswered`            | The methods the app called that the fake has no answer for.           |

The fake doesn't record the calls the app makes, on purpose: see "Asserting" below.

Chats are private chats only, for now: no groups, channels, media or folders.

## Driving the app: `boot()`

`boot({ telegram, width = 80, height = 24, env = {} })` starts the app and resolves once it has
loaded. It rejects, with everything the app logged, if the app exits or crashes while starting.
`env` adds to, or overrides, the environment the app sees. That environment already has every
`XDG_*` directory pointing into the test's own home, and an app key in `TUIGRAM_API_ID` and
`TUIGRAM_API_HASH`, so the setup form is skipped.

The handle it resolves to:

| Member                              | What it does                                                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `await app.waitForText(text)`       | Resolves to the frame once it contains `text`. Throws after 3 s, with the last frame and the log.                                                             |
| `await app.waitForFrame(predicate)` | The same, for any condition on the frame.                                                                                                                     |
| `await app.frame()`                 | The screen now, as text.                                                                                                                                      |
| `app.press(key, modifiers)`         | One key: a character (`'j'`), or a name from opentui's `KeyCodes` (`'RETURN'`, `'ESCAPE'`, `'TAB'`, `'ARROW_UP'`, …). `modifiers` is `{ ctrl, shift, meta }`. |
| `await app.type(text)`              | Types `text`, one key at a time.                                                                                                                              |
| `app.spawned`                       | The programs the app started, as `{ cmd, args }`. None of them ran.                                                                                           |
| `app.fetched`                       | The URLs it requested. Every request failed, as with no network.                                                                                              |
| `app.logs`                          | What the app logged, wrote to stderr, or reported as a crash.                                                                                                 |
| `app.sandbox`                       | The app's globals (`store`, `ui`, `actions`, …). Prefer what's on screen.                                                                                     |
| `await app.stop()`                  | Quits the way the app does (`Crash.exit`), waits for it, deletes its home.                                                                                    |

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
  Don't look at the app after it has exited.
- **Nothing is spawned.** A test that opens a file, a link or the editor sees the command in
  `app.spawned`, and the program "exits" with 0 on the next turn.
- **The headless renderer is not a real terminal.** A few timing problems only show up in a real
  one (Textarea's `onContentChange` arriving a key late is one). Those need a manual run.
- **`@mtcute/test` is imported by file path** (`test/telegram.js`), because its entry point only
  loads under vitest. `docs/MTCUTE_BUGS.md` has the details, and what else the stub needs to
  deliver updates at all.
