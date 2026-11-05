# mtcute bugs and sharp edges

Findings against `@mtcute/test@0.32.7` and `@mtcute/core@0.32.7`/`@mtcute/node@0.32.7`, turned
up while running the whole app headless on mtcute's `StubTelegramClient` (a fake Telegram behind
a real `TelegramClient`, for integration tests). tuigram itself is on 0.32.5; `@mtcute/test`
0.32.7 wants `@mtcute/core ^0.32.7`, so the two have to move together. Paths are relative to
`node_modules/@mtcute/`; each one comes with the grep that finds it again.

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
