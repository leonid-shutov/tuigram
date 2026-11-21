# mtcute bugs and sharp edges

tuigram is on `@mtcute/core`, `@mtcute/node` and `@mtcute/test` 0.32.8. `@mtcute/test` wants a
matching `@mtcute/core`, so they have to move together. The first section was found in the real
app. The rest turned up while running the whole app headless on mtcute's `StubTelegramClient` (a
fake Telegram behind a real `TelegramClient`, for integration tests), against 0.32.7. Paths are
relative to `node_modules/@mtcute/`; each one comes with the grep that finds it again.

## Bug: a min channel poisons the peer cache, and every later call is `CHANNEL_INVALID`

Seen on 0.29.7, reproduced live on 0.32.5, and the code is unchanged in 0.32.8. A channel you are
a member of starts failing with `CHANNEL_INVALID` on every call that names it by id (older
history pages, `readHistory`, sending, downloads, forwarding), and stays broken until tuigram
restarts. The first call after the trigger still succeeds, and the stored peer row looks fine
again a moment later, which is what makes it hard to pin down:

```
RpcError (400 CHANNEL_INVALID): Telegram API error 400: CHANNEL_INVALID
    at messages.forwardMessages
    at async Module.forwardMessagesById (…/@mtcute/core/highlevel/methods/messages/forward-messages.cjs:39:15)
    at async Object.forwardMessage (src/4-messenger/(methods)/forwardMessage.js:4:16)
```

The trigger is a `min: true` copy of the channel: Telegram sends one inside a forward or a reply
in some other chat, with a limited access hash that only works through that message. Three
things in `PeersService` (`core/highlevel/storage/service/peers.cjs`) then combine:

1. **The min copy overwrites the good row.** For a min peer over a full one, `store()` builds a
   merged `newComplete` but writes `dto`, the min access hash with `isMin` set, to the database
   (`grep -n "await this._peers.store(dto)" peers.cjs`). Its lookup of the existing peer also
   uses the bare id (`grep -n "getCompleteById(peer.id)" peers.cjs`), while channel rows are
   stored under the marked `-100…` id, so for channels that lookup usually misses.
2. **The min hash gets cached under the marked id.** The next `resolvePeer` misses in `getById`
   (the row is min), falls back to `getCompleteById(peerId, true)`
   (`grep -n getCompleteById core/highlevel/methods/users/resolve-peer.cjs`), and that caches
   `getInputPeer(minDto)` under the marked id. The username or `channels.getChannels` fallback
   makes this one call work.
3. **The full channel never replaces the bad entry.** When the full channel arrives again,
   `store()` fixes the database row but keys the cache by the bare `peer.id`
   (`grep -n "_cache.set(peer.id" peers.cjs`), so the marked-id entry stays. It goes only when
   the 100-entry LRU evicts it, or on restart. The same bare id in `_refs.deleteByPeer(peer.id)`
   means a channel's message refs were never deleted either.

A session collects these quickly: one had 54 channel rows flagged `isMin` in `session.db`.

### Workaround

Restarting tuigram clears the cache, until the next min copy of that channel arrives. Inside
tuigram, passing the dialog's stored `inputPeer` instead of a numeric chat id would skip
`resolvePeer` and its cache altogether, but every messenger method takes a chat id today.

### Fix

Drafted, not yet pushed or sent upstream: branch `fix/min-peer-cache` in the
[leonid-shutov/mtcute](https://github.com/leonid-shutov/mtcute) fork, with the full write-up and
a live repro script in its `PR_DESCRIPTION.md`. In short: when a min peer arrives over a full one,
keep the full access hash and store the merged `complete` with `isMin` off; key the cache,
pending writes and refs by the marked id (`dto.id`); record `isMin` on cache entries so `getById`
never returns a min hash from the cache. It adds 7 tests that fail on mtcute `master` and pass
with the fix.

## Bug: `@mtcute/test` cannot be imported outside vitest

The package is published as a general test-utilities package, but its entry point only loads
inside vitest (or a bundler). Under plain Node — `node --test`, which tuigram uses — `import
'@mtcute/test'` fails three separate ways, each hiding the next:

1. **`@mtcute/web` is required on Node.** `client.js` imports `./platform.web.js`, which imports
   `@mtcute/web` (`grep -n "@mtcute/web" test/platform.web.js`). The package's `browser` field
   maps `./src/platform.js` → `./src/platform.web.js`, but neither path exists in the published
   files and no Node `platform.js` is shipped — only `platform.d.ts`. `@mtcute/web` is an
   optional peer, so nothing installs it:

   ```
   ERR_MODULE_NOT_FOUND: Cannot find package '@mtcute/web' imported from …/@mtcute/test/platform.web.js
   ```

2. **A JSON import without an import attribute.** `schema.js` (behind `createStub`) does
   `import * as schema_ from "@mtcute/core/tl/api-schema.json"` (`grep -n "api-schema"
test/schema.js`). Node requires `with { type: 'json' }`; only a bundler accepts it bare:

   ```
   ERR_IMPORT_ATTRIBUTE_MISSING: Module "…/@mtcute/core/tl/api-schema.json" needs an import attribute of "type: json"
   ```

3. **`vitest` is imported at the top level.** `index.js` re-exports `crypto.js`, which starts
   with `import { beforeEach, vi, afterEach, beforeAll, it, expect, describe } from "vitest"`
   (`grep -n vitest test/crypto.js`). `vitest` is a required peer even if you only want the stub
   client.

### Workaround

`StubTelegramClient` itself (`client.js`) needs none of the three. `exports` lists only `.`, so
import it by file path, install `@mtcute/web` as a dev dependency, and build TL objects by hand
(`createStub` only fills defaults in from the schema):

```js
// `exports` blocks every subpath, `./package.json` included, and has only an `import`
// condition, so `require.resolve` finds nothing: point at the directory itself.
const dir = path.join(rootDir, 'node_modules', '@mtcute', 'test');
const { StubTelegramClient } = await import(path.join(dir, 'client.js'));
```

### Suggested upstream fix

Ship a Node `platform.js` (or a conditional `exports` entry) instead of the stale `browser`
map; add `with { type: 'json' }` to the schema import; move the vitest helpers in `crypto.js`
behind a separate subpath export (e.g. `@mtcute/test/vitest`) so the entry point is
runner-agnostic.

## Sharp edge: `StubTelegramClient` defaults to web crypto, which fails late on Node

The stub's defaults are `new WebPlatform()` and `new WebCryptoProvider()`
(`grep -n "Web" test/platform.web.js`). On Node, `WebCryptoProvider.initialize()` loads its
WebAssembly with `fetch()` on a `file://` URL (`grep -n "fetch(" web/wasm.js`), which Node's
`fetch` does not implement. Nothing fails at construction or on stubbed calls, so
`getHistory()` works; the error only surfaces once something initializes the network layer,
e.g. `startUpdatesLoop()`:

```
TypeError: fetch failed  [cause: Error: not implemented... yet...]
    at loadWasmBinary (@mtcute/web/wasm.js:7:19)
    at WebCryptoProvider.initialize (@mtcute/web/crypto.js:47:20)
```

### Workaround

Pass the Node providers. `NodeCryptoProvider` is not on the package root; it lives in the
`utils.js` subpath:

```js
const { NodePlatform } = require('@mtcute/node');
const { NodeCryptoProvider } = require('@mtcute/node/utils.js');
new StubTelegramClient({ crypto: new NodeCryptoProvider(), platform: new NodePlatform() });
```

## Sharp edge: an unstubbed call hangs forever instead of failing

`StubTelegramClient.call()` answers from its responders, and anything else falls through to
`super.call()` over `StubTelegramTransport`, which never replies
(`grep -n "async call" -A6 test/client.js`). A missing responder therefore shows up as a test
that hangs, with no method name anywhere. The first one hit here was `updates.getDifference`,
called by `startUpdatesLoop()`.

### Workaround

Wrap `call` so an unknown method rejects with its name:

```js
const call = stub.call.bind(stub);
stub.call = (message, params) =>
  stub._responders.has(message._) ? call(message, params) : Promise.reject(new Error(`unstubbed ${message._}`));
```

### Suggested upstream fix

A `strict` option on `StubTelegramClient` that rejects unknown methods, the way
`StubTelegramClient.offline()` already throws for every call.

## Sharp edge: stub updates are dropped silently unless three things are set up

`stub.onServerUpdate.emit(stub.createStubUpdates({ … }))` reaches a `Dispatcher` only when all
of these hold, and at the stub's default `logLevel: 0` a missing one gives no sign at all:

1. **`disableUpdates: false`.** The stub hardcodes `disableUpdates: true`
   (`grep -n "disableUpdates" test/client.js`); it can be overridden because `...params` is
   spread last.
2. **`startUpdatesLoop()`, with `updates.getState` and `updates.getDifference` stubbed.**
   Without `getDifference` the loop hangs (see above); `updates.differenceEmpty` is enough.
3. **A current user in storage.** Without one, the updates manager throws `MtArgumentError: User
info is not cached yet` on the first `updateNewMessage`, logs it at error level, restarts the
   loop, and the update is gone. Store one first:

   ```js
   await stub.prepare();
   await stub.storage.self.store({ userId: 1, isBot: false, isPremium: false, usernames: [] });
   ```

## Improvement: `iterDialogs` paginates until it receives an empty page

`iterDialogs` (`core/highlevel/methods/dialogs/iter-dialogs.js:132`,
`grep -n "if (!dialogs.length) return" iter-dialogs.js`) stops only on an empty page or on
reaching `limit`:

```js
for (;;) {
  const dialogs = Dialog.parseTlDialogs(await client.call({ _: 'messages.getDialogs', offsetId, … }));
  if (!dialogs.length) return;
  …
}
```

It ignores two signals that the list is done: a response of type `messages.dialogs` (in the TL
schema, the complete list, as opposed to `messages.dialogsSlice`), and a page shorter than the
`limit` it asked for. So every full scan costs one extra `messages.getDialogs` round trip that
comes back empty. Against a server, or a fake, that repeats a page, it never ends: a fake that
ignored `offsetId` drew 293 identical requests before a guard stopped it. And because the stub's
responders resolve as microtasks, that loop never yields to the event loop, so no timer fires
(test timeouts included) and the process just hangs.

### Suggested upstream fix

Return after yielding a `messages.dialogs` response, or a page shorter than the requested
`limit`; break if `offsetId`/`offsetPeer` did not advance.

## Checked, and fine

- `new TelegramClient({ client: stub })` (the `client` option of `TelegramClientOptions`) puts
  the full high-level client on the stub: `getHistory` parses stubbed `messages.messages` into
  real `Message` objects with senders resolved from `registerPeers`, and the `Dispatcher`
  receives stub updates once the setup above is in place.
- The whole of tuigram booted on it: sign-in through the stored-account path, the dialog list,
  opening a chat, `readHistory`, and a live incoming message drawn in the open chat. Startup
  needed seven methods stubbed: `users.getUsers`, `updates.getState`, `updates.getDifference`,
  `messages.getDialogs`, `messages.getDialogFilters`, `messages.getHistory`,
  `messages.readHistory`.
