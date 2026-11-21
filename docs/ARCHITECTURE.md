# Architecture

tuigram has no `require` or `import` under `src/`. The app is a directory tree that
[uncommonjs](https://github.com/leonid-shutov/uncommon-js) loads into one object graph: the shape
of the tree is the wiring. This page is what you need to know before touching `src/`.

## How the app boots

1. `bin/tuigram.js` handles `--help`, `--version` and `upgrade`, then re-runs itself with
   `--experimental-ffi` (opentui reaches its native renderer through `node:ffi`) and points
   `console` at the log file — the renderer owns the terminal.
2. `bin/world.js` builds the **world**: everything the app touches outside the process — the
   terminal renderer, mtcute's `TelegramClient`, `child_process.spawn`, `https.get`.
3. `bin/context.js` builds the sandbox from the world, plus opentui (`tui`), the keymap and a
   few constants.
4. `uncommonjs.loadTree(context, { rootDir })` loads `src/` into that sandbox, and
   `src/start.js` runs last.

The tests build the same sandbox from a test world instead (`test/world.js`: a headless renderer
and a fake Telegram), so the code under `src/` cannot tell the two apart. See
[TESTING.md](TESTING.md).

## The one rule for files

**A file's last expression is its export.** No `module.exports`, no `export`.

```js
// src/8-actions/openChat.js — a function
/** @type {Actions['openChat']} */
async (chatId) => {
  ui.dialogs.select(chatId);
  navigation.select('chat');
  // ...
};
```

```js
// an object: wrap it in parentheses, or it parses as a block and exports nothing
({ available: null });
```

Anything above the last expression — comments, helpers, constants — is private to the file if
declared with `const`, `let`, `function` or `class`. A top-level `var` is shared with the whole
module, so don't use one.

## What every file can see

| Global                                 | What it is                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------- |
| `node.*`                               | every Node builtin: `node.fs`, `node.path`, …                                    |
| `npm.*`                                | every dependency in `package.json`: `npm['@mtcute/node']`, `npm['string-width']` |
| `self`                                 | the module the file belongs to                                                   |
| `config`, `screen`, `auth`, … `ui`, …  | every loaded layer, by name (see below)                                          |
| `Crash`, `Result`, `Arr`, `Obj`, …     | the shared helpers in `src/(common)/`                                            |
| `tui`, `Keymap`, `world`, `console`, … | what `bin/context.js` puts in the sandbox                                        |

## How the tree maps to names

| On disk        | Becomes                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------- |
| `chat/`        | a module, `ui.chat`                                                                         |
| `chat/chat.js` | named after its directory, so it merges _into_ `chat` instead of nesting as `chat.chat`     |
| `6-ui/`        | a numeric prefix sets the load order and is stripped: `ui`                                  |
| `(common)/`    | loaded first, into the **parent**, and visible to every sibling                             |
| `(getters)/`   | each file is `() => value` and becomes a property computed on every read                    |
| `(anything)/`  | grouping only — `(methods)`, `(public)`, `(private)` and the rest are there for readability |

## The layers

`src/` loads in prefix order. Names resolve when code runs, not when it loads, so any layer can
call any other at runtime; the order matters only for code that runs while the tree loads.

| Layer              | Job                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `1-config`         | paths, credentials, `config.json` and its schema, themes                                   |
| `2-screen`         | the renderer and the app's frame                                                           |
| `3-auth`           | the Telegram client and signing in (QR, phone and code, 2FA)                               |
| `4-messenger`      | everything that talks to Telegram, wrapped around mtcute                                   |
| `5-store`          | app state — dialogs, the open chat, folders, peers — each store emitting `change`          |
| `6-ui`             | the panes and pickers, built on opentui; they draw what they're given and emit events      |
| `7-navigation`     | which pane has focus                                                                       |
| `8-actions`        | one file per thing the app does; the only layer that ties messenger, store and ui together |
| `9-keymap`         | key bindings, commands and the hint bar                                                    |
| `10-subscriptions` | the wiring: Telegram updates, store changes and ui events, each sent to an action          |
| `(common)`         | domain helpers (`Message`, `Dialog`, …), data structures, `Crash`, `Result`                |

A typical feature is: a command in `9-keymap` calls an action in `8-actions`, which calls the
messenger and updates a store; the store emits `change`, and `10-subscriptions/store.js` runs the
repaint actions that read it. Stores emit a bare `change` and repaints must be idempotent and
cheap when nothing changed — see [ADR 0002](decisions/0002-coarse-store-events.md).

## Types

`tsc` type-checks every file under `src/` (`checkJs` in `tsconfig.json`, so no `// @ts-check`
is needed). The globals are declared in `types/*.ts`; a file states its own type with a JSDoc tag
on its export, as `openChat.js` does above. Adding an action, a store method or a ui method means
adding its signature to `types/` too. `npm run types` checks it.

## Errors

opentui and mtcute swallow exceptions thrown from their callbacks, so an error that escapes there
disappears. Catch where the app hands control to them, and use:

- `ui.errors.report(message, error)` — the user should know something failed;
- `Crash.soft(error)` — log it and carry on;
- `Crash.hard(error)` — the app can't continue.

## Sharp edges

- **Load order sorts as strings**, so `10-` would sort before `2-`. Zero-pad the prefixes
  (`01-` … `10-`), as the layers are.
- **Subdirectories load before files** in the same directory.
- **`(common)/` reaches only its own subtree.** A helper in `6-ui/(common)/` is not visible in
  `8-actions`; put it in `src/(common)/` if both need it.
- **`instanceof` fails for objects made outside the sandbox** (anything from Node or the world).
  Check their shape instead.
- **opentui has quirks** that are easy to mistake for bugs in tuigram; the known ones are in
  [OPENTUI_BUGS.md](OPENTUI_BUGS.md), and mtcute's in [MTCUTE_BUGS.md](MTCUTE_BUGS.md).
