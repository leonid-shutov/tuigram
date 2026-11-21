---
name: uncommonjs
description: >-
  Author and structure code in tuigram's src/ tree, which @leonid-shutov/uncommonjs loads.
  Use when creating, moving or renaming files under src/, wiring modules, using the injected
  node.*/npm.* globals, self or __rootDir, the (common)/(getters) directories, numbered
  prefixes, or .json data files. Covers the file-as-expression rule and the loading rules.
---

# uncommon-js

`@leonid-shutov/uncommonjs` (3.x) is a convention-over-configuration loader built on
`node:vm`. App files have no `require` or `import`: the directory tree under `src/` _is_ the
wiring. `loadTree` walks it, runs each module's files in a `node:vm` context of their own, and
returns one object graph. Builtins, npm packages and shared helpers arrive as globals.

The library has no runtime dependencies and exports three functions: `loadTree`, plus the
lower-level `loadDir` and `loadFile`. Anything else you see in `src/(common)/` — `Arr`, `Obj`,
`Result`, `LinkedList`, … — is tuigram's own code, not the library's.

## 1. The one rule

**A file's last expression is its export.**

```js
({ title: 'Book', create: (name) => db.insert(name) });
```

```js
const sql = 'select * from book where code = $1';

async (code) => (await db.query(sql, [code])).rows[0] ?? null;
```

Anything above the last expression is the file's own: comments, JSDoc, constants, helpers.
Declared with `const`, `let`, `function` or `class`, they stay private to the file; a
top-level `var` or `globalThis.x = …` is shared with the rest of the module. Every file runs in
strict mode.

No `module.exports`, no `export`. Wrap a returned object in parentheses: a bare `{ ... }` is a
block, and blocks export nothing. A file whose value is `undefined` adds nothing.

## 2. Bootstrapping

```js
const { loadTree } = require('@leonid-shutov/uncommonjs');

const app = await loadTree(sandbox, { rootDir, treePath: 'src' });
```

- `sandbox` — the globals the app should see. It is returned, populated with the tree.
- `rootDir` — defaults to the working directory, resolved to an absolute path.
- `treePath` — defaults to `src`; relative to `rootDir`, or absolute.

In tuigram, `bin/tuigram.js` builds the sandbox with `createContext` from `bin/context.js`
(`console`, `process`, `crashReport`, `world`, `tui`, `Keymap`, …) and calls
`loadTree(context, { rootDir })`. `test/app.js` does the same against a test world.

## 3. Globals in every file

| Global       | What it is                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `node.*`     | Every public Node builtin, loaded on first read: `node.fs`, `node.path`, `node['fs/promises']` |
| `npm.*`      | Every package in `dependencies` of `package.json`, by name: `npm['string-width']`              |
| `self`       | The module the file belongs to; writes through it land on the module                           |
| `__rootDir`  | The resolved `rootDir`                                                                         |
| your sandbox | Whatever was passed to `loadTree`                                                              |
| tree members | Top-level modules and `(common)/` members in scope (see §4)                                    |

- `node.*`: builtins that exist only with the prefix drop it (`node.sqlite`, `node.test`).
  Node's `_`-prefixed internals are not listed. A builtin that fails to load throws when read.
- `npm.*`: only `dependencies`, not `devDependencies`. A CommonJS package loads on first read.
  An ES module is imported before any app file runs, and reads as its default export when it
  has one, as its namespace otherwise. Only top-level package names are there: subpath
  exports aren't, which is why tuigram passes `@opentui/keymap/opentui` and `/extras` in
  through the sandbox as `Keymap`.

## 4. Directory and file conventions

| Path              | Becomes                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `book/`           | a submodule, `app.book`                                                                  |
| `book/book.js`    | named after its directory, so it merges _into_ `app.book` instead of nesting             |
| `book/create.js`  | `app.book.create`                                                                        |
| `book/tags.json`  | data, parsed: `app.book.tags`                                                            |
| `03-auth/`        | a numbered prefix sets load order and is stripped from the key: `app.auth`               |
| `(common)/`       | loaded first, into the **parent** scope: its members are globals there                   |
| `(getters)/`      | each file is `() => value` and becomes a computed property, evaluated on every read      |
| `(anythingElse)/` | grouping only, fully transparent: files _and_ subdirectories load as if it weren't there |

Only `(common)` and `(getters)` mean anything to the loader. `(components)`, `(utils)`,
`(screens)`, `(methods)` and the rest only organize files.

Files other than `.js` and `.json` are skipped. A `.json` file is keyed like a `.js` one, so
`Locale/ru.json` is `Locale.ru`.

### Load order

Within a directory: `(common)/` first, then the other directories, then the files, each group
in name order. Names compare with numbers as numbers (`2-` before `10-`), the way VS Code's
explorer lists them. That's why tuigram's layers are `01-config/` … `10-subscriptions/`, and
why `src/start.js` runs after all of them.

Order only matters for code that runs while loading: a file's top-level code, or a value
computed on its last line. A function that reads a sibling when called works whatever the
order.

### Scope: what a file can reach by name

- **Top-level modules** are globals everywhere: `screen`, `auth`, `messenger`, … (the
  numbered layers, prefixes stripped).
- **`(common)/` members** are globals in the scope that holds the `(common)/`: at the top of
  the tree, everywhere (`Locale`, `Arr`, `Result`, …), and they are on `app` too. Inside a
  module, `book/(common)/validate.js` makes `validate` a global for `book/` and below, and it
  is **not** on `app.book`.
- **Anything else in your own module** is reached through `self`: `self.create`,
  `self.profile.get`. Siblings of other modules are reached through their module, as in
  `screen.renderer.suspend()`.

Names must not collide. A module or file named like a global or a sibling merges into it
silently, and a function merged into an existing object is lost.

### Realms

The files of a module share one `node:vm` context, so `instanceof` holds between them. Each
module has its own, so a value from another module comes from another realm: compare by shape
or `.name`, not with `instanceof Error` or `instanceof Object`. A `.json` file is parsed in its
module's realm.

Errors thrown by app files name the file and line.

## 5. Worked example

```
src/
  (common)/
    logger.js        # global everywhere, and app.logger
  book/
    book.js          # merges into app.book
    create.js        # app.book.create
    tags.json        # app.book.tags
    (common)/
      validate.js    # global inside book/; not on app.book
    (getters)/
      count.js       # app.book.count, computed on every read
```

```js
// src/(common)/logger.js
({ info: (message) => console.log(`[app] ${message}`) });
```

```js
// src/book/book.js
({ table: 'book', registry: new Map() });
```

```js
// src/book/create.js
(book) => {
  if (!validate(book)) throw new Error('invalid book'); // book/(common), no import
  logger.info(`inserting into ${self.table}`); // src/(common), and the module itself
  const id = node.crypto.randomUUID(); // a node builtin, no import
  self.registry.set(id, book);
  return id;
};
```

```js
// src/book/(common)/validate.js
(book) => typeof book?.name === 'string';
```

```js
// src/book/(getters)/count.js
() => self.registry.size;
```

## 6. In tuigram

- A new global — a `(common)/` member or a top-level layer — goes into the `globals` of
  `eslint.config.js` and is declared in `types/global.ts`, like the existing ones.
- Reach a layer by its unprefixed name: `messenger`, never `app['04-messenger']`.
- Shared code goes in `(common)/`; a group folder like `(components)/` or `(utils)/` only
  organizes it.
