# ADR 0002: integration tests run the whole app in a test world

## Status

Accepted.

## Context

The two parts of tuigram that most need tests are the two it doesn't own: mtcute (Telegram)
and opentui (the terminal). Mocking either one, or mocking tuigram's own modules around them,
tests the mock: a test passes as long as the code calls what the test expects, whether or not
Telegram would have answered that way or the terminal would have drawn that. Backend services
solve the same problem with testcontainers and localstack: the real code runs against a real
(or faithful) instance of the dependency, created fresh for the test and thrown away after.

Two properties of the codebase shape what that can look like here:

- **Loading is running.** uncommonjs's `loadTree` loads `src/` layer by layer, and each file is
  an expression that runs as it loads: `02-screen` takes the terminal, `03-auth` signs in,
  `start.js` loads the dialogs. There is no "build the app, then start it": the only way to
  get a working app is to load the whole tree.
- **The outside world comes in through one object.** `bin/tuigram.js` hands `loadTree` a
  context (`console`, `process`, `tui`, …), and everything `src/` touches beyond its own files
  either is in that context or is reached through uncommonjs's `node`/`npm` globals.

When this was decided, four things in `src/` reached outside the process through those globals,
where a test could not intercept them:

| Where                                                                                                                 | What it does                                           |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `02-screen/1-renderer.js`: `tui.createCliRenderer`                                                                    | takes over the terminal                                |
| `03-auth/(methods)/createClient.js`: `new TelegramClient`                                                             | connects to Telegram                                   |
| `(common)/OS/(common)/spawnDetached.js`, `(common)/OS/run.js`, `08-actions/openConfig.js`: `node.child_process.spawn` | runs `notify-send`, `xdg-open`, `$EDITOR`, the upgrade |
| `(common)/Fetch/once.js`: `node.https.get`                                                                            | the update check                                       |

A test that booted the app as it was would pop real desktop notifications and make real
HTTPS requests, and could not run without a Telegram account.

## Options considered

- **Mock mtcute and opentui calls.** Rejected for the reason above: it tests the mock.
- **A fake `messenger`, at the level of tuigram's own domain objects.** A hand-written
  `messenger` returning `Message` and `Dialog` objects directly makes scenarios easy to write,
  but it skips `04-messenger` itself: the `to*` mappers, album grouping, and paging, which is
  where Telegram's behaviour has bitten before (the min-peer cache poisoning, albums split
  across pages). It is also a fake of an interface tuigram owns, so it drifts from the real one
  with nothing to notice.
- **Layer tests: load part of the tree.** Loading a few layers by hand with uncommonjs's
  `loadDir` gets the loader's rules subtly wrong (the order and scoping of `(common)`
  directories, what `self` is), and a layer-selection option in uncommonjs would only make
  this cheaper. Either way it tests layers in isolation, and the interesting failures are
  between them.
- **Override packages in the loader.** Let tests replace `npm['@mtcute/node']` (a new
  `loadTree` option, or patching the cached module's export before boot). It needs no change
  in `src/`, but the replacement is invisible from the code that uses it, and it makes swapping
  out any package trivial, which leads back to mocking.
- **Black box: run `bin/tuigram.js` in a pseudo-terminal.** The most faithful option for the
  terminal, and the only one that reproduces real-terminal timing. But it is slow, its
  assertions go through an emulated screen, and faking Telegram under it needs the same seam as
  the chosen option anyway. Kept in reserve for bugs only a real terminal shows.

## Decision

1. **Every way `src/` reaches outside the process goes through one injected object, `world`.**
   It has four parts: `terminal.createRenderer`, `telegram.Client`, `spawn` and `https.get`.
   The real one is `bin/world.js`; the test one is `test/world.js`. Both have the shape typed in
   `types/global.ts`, so the type checker keeps the fake in step with the real thing.
   `node.child_process` and `node.https` are deliberately left out of the typed `node` globals,
   so code in `src/` that goes around `world` does not type-check.
2. **The sandbox's context is built in one place, `bin/context.js`,** for both the app and the
   tests. What differs comes in as arguments: the `world`, `console`, `process`, and
   `crashReport`. The tests boot exactly what `bin/tuigram.js` boots.
3. **Telegram is faked at the wire, under the real client.** `test/telegram.js` wraps mtcute's
   own `StubTelegramClient` (from `@mtcute/test`), which answers raw MTProto calls; the test
   world hands the app mtcute's real `TelegramClient` on top of it. Everything above the wire
   runs for real: mtcute's parsing, peer cache and updates manager, the `Dispatcher`, and all of
   `src/`. The fake keeps a small world (users, and a history per chat) and answers from it the
   way the server would, paging included. This is the localstack of the suite.
4. **The terminal is opentui's headless test renderer** (`@opentui/core/testing`): the real
   renderer, layout and drawing, minus a TTY, plus frame capture and mock key input.
5. **Files stay real**, in a fresh temporary home: the test sets every `XDG_*` directory under
   it, so config, the sqlite session and the cache start empty and are deleted after. This is
   the throwaway volume of a testcontainer.
6. **`process` stays as the input it already is.** The test passes the real `process` with its
   environment, `argv`, `exit`, `stderr` and crash-handler registration replaced.
7. **Timers stay real.** A fake clock would only reach tuigram's own timers; mtcute's album
   grouping and update handling and opentui's rendering keep using real time, and two clocks
   out of step would cause more confusion than they save. Tests wait for what they expect to see
   instead of sleeping for fixed times.
8. **Tests are integration tests only.** Each one boots the whole app, drives it with keys and
   Telegram events, and asserts on what a user or the system would see: the frame, the programs
   started, the URLs fetched, the Telegram calls made.

## Consequences

- Five call sites in `src/` changed to go through `world`, a line or two each, plus
  `openConfig.js`, which had its own copy of `OS.run` and now calls it.
- A test covers the app the way it runs: a bug anywhere between Telegram's answer and the
  frame (mapping, store, actions, layout) fails it.
- Nothing a test does leaves the process: spawns and requests are recorded, every request
  fails as with no network, and there is no Telegram account behind the fake.
- Booting the app costs roughly 0.4 to 0.9 seconds per test.
- The fake Telegram has to be taught every method the app starts calling. A method it does not
  know fails with its name (and every test checks that none did), so a gap shows up as a failed
  test, not a hang.
- `@mtcute/test` only partly works outside vitest (see `docs/MTCUTE_BUGS.md`): the stub client is
  imported by file path, `@mtcute/web` is a dev dependency, and npm installs `vitest` as its
  required peer even though the tests run on `node:test`.
- The headless renderer does not reproduce every real-terminal timing problem (Textarea's
  `onContentChange` arriving a key late is one that never shows up headless). Those still need
  a run in a real terminal.
- Test files are not type-checked (`tsconfig.json` covers `src/` and `types/`).

## References

- `docs/TESTING.md`: how to run and write the tests.
- `docs/MTCUTE_BUGS.md`: the sharp edges of `@mtcute/test` this design works around.
- [mtcute `@mtcute/test` API reference](https://ref.mtcute.dev/modules/_mtcute_test.html)
- [Testcontainers](https://testcontainers.com/) and [LocalStack](https://www.localstack.cloud/),
  the model this follows.
