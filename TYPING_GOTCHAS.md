# Typing gotcha: shared global script scope

This project adds types to `src/**/*.js` via JSDoc, without converting any
file to an ES module. That last part is not optional: every file under `src/` is executed by
the `@leonid-shutov/uncommonjs` loader as a plain `node:vm` script, not a module. Adding a
top-level `import`/`export` statement to one of these files would throw a syntax error the
moment the loader tried to run it, since `import`/`export` are only legal in module-goal
parsing, not script-goal.

## The gotcha

TypeScript has a long-standing rule: a `.js`/`.ts` file with no top-level `import`/`export`
statement is treated as a legacy **script**, not a module. Every top-level `const`/`let`/
`function`/`@typedef` declared in *any* script-mode file is merged into **one shared global
type-checking namespace across the whole `tsc` program** — not scoped to that file. This is
standard, decades-old behavior (the same reason old pre-module `<script>` tags on a page all
share one global scope), but it's easy to forget when your files are only ever combined at
runtime through this project's own VM-based per-file isolation, which `tsc` knows nothing about.

## What this actually broke

`src/1-config/(common)/paths.js` had:

```js
const config = xdg('XDG_CONFIG_HOME', '.config');
```

This `config` was meant to be a purely local variable — a directory path string, used only to
build `settings`/`credentials`/`session` paths within that one file. Because the file is
script-scoped, that declaration became a **global** type binding. Meanwhile the real app-wide
`config` (injected by the loader everywhere else, shaped like `{ theme, credentials, cli, paths }`)
is also declared as a global (in `types/global.ts`). TypeScript merged the two, and the
practical effect surfaced in a totally unrelated file: `Frame.js` does `config.theme.borderStyle`,
and `tsc` reported `Property 'theme' does not exist on type 'string'` — it had latched onto
`paths.js`'s local `config: string` instead of the real one.

The fix was a plain rename (`config` → `configDir`, and `data`/`state` → `dataDir`/`stateDir` for
the same reason) — zero runtime behavior change.

## Why it's worth remembering

There's no clean fix at the root without restructuring these files (e.g. wrapping each in an
IIFE to get real lexical scoping), which is a bigger, riskier change than adding types. So the
residual risk stands: any future file that declares a common-sounding local name (`data`,
`state`, `text`, `error`, `source`, ...) at its top level can silently collide with either
another file's local or a real ambient global from `types/*.ts`. It won't always announce
itself as cleanly as the `config` case did — two colliding declarations with *compatible-looking*
shapes can merge quietly with no error at all, producing a wrong-but-unflagged type.

**How far this is mitigated now:** `checkJs: true` means every file under `src/` is checked,
so two top-level `const`/`let` declarations of the same name are a hard `TS2451 Cannot
redeclare` error rather than a silent merge. Turning it on surfaced a real collision:
`SUFFIXES`, declared in both `3-auth/4-logout.js` and `3-auth/(private)/secureSession.js`,
which was renamed. What is still *not* caught is `@typedef` and `var`/`function` declarations,
which merge rather than conflict — so when adding one, still check the name against
`types/global.ts` and `types/ui.ts`.

## `// @ts-check` changes how the loader classifies a file

`lib/util.js` decides whether a file is an object module or a function module with
`isObjectLiteral = (src) => src.startsWith('({')`, and that choice controls whether the file
gets its own `self` scope. A leading `// @ts-check` comment means the source no longer starts
with `({`, so **adding the comment silently reclassifies an object module as a function
module**. That is why this project uses `checkJs: true` in `tsconfig.json` instead: no per-file
marker, so the three genuine object modules (`(common)/(keyboard)/Keys.js`,
`3-auth/ui/ui.js`, `5-ui/3-layout/1-layout.js`) keep starting with `({`.

The same heuristic misfires in the other direction on its own: an arrow function with a
destructured first parameter — `({ title, children }) => {…}` — also starts with `({` and was
being loaded as an object module. Six files were in that state. The consequence is real for
any such file that *writes* to `self`: the write lands on a per-file shadow `self` that no
sibling can read. `3-auth/ui/(private)/mount.js` was the one affected — its
`self.current = handle` was invisible to `(public)/dispose.js`, making `auth.ui.dispose()` a
silent no-op. Prefixing those six with a JSDoc annotation restores the correct classification
and fixes that.

## Related gotchas hit typing this codebase

- **Default `lib` pulls in DOM globals.** `tsconfig.json` didn't set `lib`, so TS defaulted to
  including `dom`, whose `Screen`/`Node`/`Text` globals collided with this app's own `screen`
  namespace, a `Node` linked-list typedef, and the `Text` component wrapper. Fixed by adding
  `"lib": ["ESNext"]` to `tsconfig.json` (correct anyway — this is a pure Node/TUI app).
- **`npm.*` is `Record<string, any>`**, so anything built from a dependency was unchecked.
  `types/global.ts` now names the three packages this app uses, which is what surfaced that
  `apiId` was being handed to mtcute as a string where it wants a number.
- **`skipLibCheck: true` means `.d.ts` files are never checked**, not even for unresolved
  imports — only the `.js` files get checked, and they just *use* whatever the `.d.ts` files
  say, right or wrong. To sanity-check a new `.d.ts` file, temporarily run
  `npx tsc --noEmit --skipLibCheck false` as a one-off (never commit that flag).
- **`@types/node` was missing.** Every `node:*` import (`node.fs`, `node.path`, `node.crypto`,
  `node.child_process`, `node.events`) silently resolved to `any` with zero errors, which
  defeated the point of typing anything that touches them. Installed `@types/node@^26` to match
  `engines.node: ">=26"`.
