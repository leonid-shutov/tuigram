# Production credential & session handling for tuigram

## Context

Today the app reads Telegram API credentials from a `.env` file in the repo:

```js
// src/1-messenger/1-tg.js
const { API_ID, API_HASH } = process.env;
const tg = new TelegramClient({ apiId: API_ID, apiHash: API_HASH });
tg.start().then(() => tg);
```

This only works when tuigram is run from a checkout with `--env-file=.env` (`npm run dev`). An
installed copy (`npx tuigram`) has no `.env`, no credentials, and no way to obtain any. Related
problems in the same area:

- **Session lives in the working directory.** `@mtcute/node` defaults to `new SqliteStorage('client.session')`
  relative to `process.cwd()` — a full, unencrypted account credential dropped into whatever folder
  the user happened to be in, created with default `0644` perms. The repo currently holds one.
- **`apiId` is passed as a string** (`process.env` values always are); mtcute expects a number.
- **Login prompts fight the TUI.** mtcute's `TelegramClient.start()` falls back to `node:readline`
  prompts on stdin, and `codeSentCallback` defaults to `console.log`. It works today only because
  `1-messenger` loads (and blocks on `tg.start()`) before the renderer exists.
- **Packaging.** No `bin` entry, so the package cannot actually be run after install; `app.log` is
  also written to cwd.

**Decisions taken** (from the clarifying questions): every user registers their **own** api_id/api_hash
at my.telegram.org — nothing is bundled in the tarball; scope covers credentials **+** session storage
**+** CLI packaging; onboarding and login happen in a **real opentui screen**, with **QR sign-in**
primary and phone+code as fallback.

**Outcome:** `npx tuigram` on a clean machine walks the user through getting credentials, signs them
in by QR, stores everything under XDG paths with tight permissions, and never touches the cwd again.

---

## Credential resolution (precedence)

1. `TUIGRAM_API_ID` / `TUIGRAM_API_HASH` env vars (also accept legacy `API_ID` / `API_HASH` so the
   existing `.env` keeps working for development).
2. `$XDG_CONFIG_HOME/tuigram/credentials.json` (`{ "apiId": 12345, "apiHash": "0123…" }`), file mode
   `0600`, directory `0700`.
3. Nothing found → the in-TUI onboarding wizard, which writes (2).

Credentials go in their own file, **not** `config.json`, because config.json is the kind of thing
people commit to a dotfiles repo.

Validation: `apiId` a positive integer, `apiHash` matching `/^[0-9a-f]{32}$/i`. Invalid values from the
env fail fast with a domain error; invalid values typed into the wizard render inline and let the user retry.

---

## Load-order restructure

The renderer must exist **before** authentication (login is now a TUI screen), and the messenger client
cannot be constructed until credentials exist. uncommonjs awaits each module's value, so a module that
evaluates to a promise blocks the rest of the load — the existing `tg.start().then(…)` already relies on
this. New top-level order:

```
(common) → 0-config → 1-screen → 2-auth → 3-messenger → 4-ui
```

| Move | From | To |
| --- | --- | --- |
| Renderer + wrapper | `src/2-ui/1-screen/` | `src/1-screen/` (globals `screen.renderer`, `screen.wrapper`) |
| UI kit | `src/2-ui/(common)/{0-Component,Box,Text,Textarea,Select,ScrollBox,KeyInput,Keys}.js` | `src/(common)/` (root) |
| Theme palette map | `src/2-ui/(common)/theme.js` | `src/0-config/(common)/themes.js` |
| Messenger | `src/1-messenger/` | `src/3-messenger/` |
| UI | `src/2-ui/` | `src/4-ui/` |

Why the kit moves to root `(common)`: both `2-auth` and `4-ui` need `Box`/`Text`/`Input`/`KeyInput` as
bare globals, and a layer's own `(common)/` is visible only inside that layer. Root `(common)` loads
first, which is fine for these (they only touch `screen.renderer` at *call* time) but **not** for
`theme.js`, which reads `config.theme` at load time — hence the palette map moves into the config layer.

Consequences, all mechanical:

- `src/0-config/theme.js` changes from returning a theme *name* to returning the resolved theme
  *object* (`themes[source.theme ?? 'aqua-lime']` plus the `selfBorder` / `selected` / `senderColors`
  defaults currently computed at the bottom of `2-ui/(common)/theme.js`).
- `src/4-ui/(common)/theme.js` and `src/2-auth/(common)/theme.js` each become the one-liner `config.theme;`
  — so every existing `theme.accent`, `Box({…})`, `Text({…})` call site is untouched.
- `ui.screen.renderer` → `screen.renderer` (6 references: `(common)/0-Component.js`, `(common)/KeyInput.js` ×2,
  `4-ui/3-layout/3-render.js` ×3).
- `src/3-messenger/1-tg.js` becomes `auth.tg;`.

---

## New: `src/0-config/`

- **`(common)/paths.js`** — XDG resolution, reusing the base logic already in `(common)/source.js`:
  `config` = `$XDG_CONFIG_HOME|~/.config` + `/tuigram`, `data` = `$XDG_DATA_HOME|~/.local/share` + `/tuigram`,
  `state` = `$XDG_STATE_HOME|~/.local/state` + `/tuigram`, plus `credentials`, `session`, `log` file paths
  and an `ensureDir(dir, mode)` helper (`fs.mkdirSync(dir, { recursive: true, mode: 0o700 })`).
- **`(common)/source.js`** — unchanged behaviour, now built on `paths.config`.
- **`(common)/themes.js`** — the palette map moved verbatim.
- **`paths.js`** — `paths;` (publishes it as `config.paths` for the auth layer).
- **`credentials.js`** — resolves steps 1–2 above, returns `{ apiId, apiHash }` or `null`. Reuse
  `Err.risk` for the `readFileSync`/`JSON.parse`.
- **`cli.js`** — parses `process.argv` into `{ command }` (`logout` is the only one that matters to the app).

## New: `src/2-auth/`

```
2-auth/
  (common)/theme.js          config.theme;
  (common)/panel.js          centered bordered Box mounted on screen.wrapper + dispose()
  1-credentials.js           await: config.credentials ?? self.wizard()   → { apiId, apiHash }
  2-client.js                new TelegramClient({ apiId, apiHash, storage: config.paths.session, logLevel: 0 })
  3-signIn.js                await: tg.start({ … }) driven by the login screens → tg
  (screens)/credentialsForm.js
  (screens)/qrLogin.js
  (screens)/phoneLogin.js
  (screens)/passwordPrompt.js
  (private)/save.js          writeFileSync(credentials, json, { mode: 0o600 }) after ensureDir
  (private)/validate.js
  (private)/qrMatrix.js
  (private)/migrateSession.js
```

**`1-credentials.js`** — if nothing resolved, mount `credentialsForm`: instructions (my.telegram.org →
API development tools → create an app; note the pair is per-user and must not be shared), two
`InputRenderable` fields, inline validation, `Enter` to submit, then `save()` and resolve.

**`2-client.js`** — `ensureDir(config.paths.data, 0o700)` and run `migrateSession` *before* constructing
the client (better-sqlite3 will not create the directory). `migrateSession` moves a legacy
`./client.session{,-wal,-shm}` from cwd to `$XDG_DATA_HOME/tuigram/session.db*` when the new path is
absent, so existing installs are not logged out. After `start()` resolves, `chmodSync(…, 0o600)` the db
and its `-wal`/`-shm` siblings (better-sqlite3 creates them `0644`).
Pass `logLevel: 0` — mtcute defaults to level 2 (WARN) writing straight to `console`, which would
corrupt the rendered screen.

**`3-signIn.js`** — `start()` calls `getMe()` first and returns immediately when the stored session is
still valid, without invoking any callback, so no screen is mounted on a normal launch. Otherwise:

- `tg.start({ qrCodeHandler, password, invalidPasswordCallback, codeSentCallback, abortSignal })` —
  passing `qrCodeHandler` selects the QR flow. `codeSentCallback` **must** be overridden (its default
  is `console.log`).
- `qrLogin` renders the login URL as a QR block and offers `p` → phone login. Choosing phone aborts the
  QR flow through the `AbortController`; the rejection is caught and `tg.start({ phone, code, password })`
  is called instead, with `phone`/`code` as promise-returning callbacks bound to `phoneLogin`.
- `passwordPrompt` covers 2FA for both flows. opentui's `Input` has no masking, so follow the app's
  existing doctrine ("focus is visual; key handling is ours", `(common)/KeyInput.js`): keep the buffer in
  the module and render `'•'.repeat(n)` in a `Text`.
- The auth key listener is registered via `KeyInput.on('keypress', …)` and **removed** once auth
  completes, so it does not compete with `4-ui/3-layout/(subscriptions)/keyInput.js`.
- If `config.cli.command === 'logout'`: `await tg.logOut()`, delete the session files, print to the log
  console and `process.exit(0)`.
- On failure (invalid credentials → `API_ID_INVALID`, banned, network) tear the screen down and surface
  a readable message rather than a raw mtcute stack.

**QR rendering** — `@opentui/qrcode` is not usable here: its lowest published version is `0.5.2` and it
pins `@opentui/core@0.5.x`, while the app is on `@opentui/core@0.4.5`; taking it would force a 0.4 → 0.5
upgrade of the whole TUI. Use the pure-JS `qrcode` package instead: `QRCode.create(url, { errorCorrectionLevel: 'L' })`
gives `modules.data` (flat 0/1) and `modules.size`; `(private)/qrMatrix.js` folds row pairs into `▀`
half-blocks (fg = upper module, bg = lower) so a ~33-module code fits in 33×17 cells. Two requirements
for scannability: force black-on-**white** regardless of theme, and keep a 2–4 module quiet zone. Show
the raw `tg://login?token=…` URL under the code as a fallback, and re-render whenever `qrCodeHandler`
fires again (the token rotates before `expires`).

## Packaging (`package.json`, `bin/tuigram.js`, `tuigram.js`)

- `"bin": { "tuigram": "bin/tuigram.js" }`. opentui needs `--experimental-ffi --allow-ffi` (see
  `FFI_LOAD_ERROR` in `@opentui/core/chunk-node-q0cwyvm9.js`), so the bin re-execs `process.execPath`
  with those flags when they are absent, guarded by an env var against a loop, then requires `../tuigram.js`.
  Also handles `logout`, `--help`, `--version`.
- `"files": ["bin", "src", "types", "tuigram.js", "README.md"]` — an allowlist is a stronger guarantee
  than the current `.npmignore` that `.env`, `client.session*` and `app.log` never ship.
- `dev` script → `node --experimental-ffi --env-file-if-exists=.env tuigram.js` (Node ≥22), so a
  missing `.env` is no longer fatal.
- `"engines": { "node": ">=22" }`; add `qrcode` to `dependencies` (uncommonjs exposes it automatically
  as `npm.qrcode` — no change to `tuigram.js`'s import wiring).
- `tuigram.js`: write the log to `$XDG_STATE_HOME/tuigram/tuigram.log` (small inline XDG duplication —
  it runs before the app loads) instead of `./app.log`; honour `TUIGRAM_LOG` as an override.
- README: a "First run" section covering my.telegram.org, the env overrides, the on-disk locations, and
  `tuigram logout`.

Lint note: this repo's eslint config rejects `return undefined` — use `null` for "no credentials".

---

## Verification

1. **Clean machine**: `XDG_CONFIG_HOME=$(mktemp -d) XDG_DATA_HOME=$(mktemp -d) npm run dev` → wizard
   appears in the TUI (no readline prompts), rejects a malformed hash inline, accepts a real pair, then
   renders a scannable QR; scanning it signs in and the dialog list loads.
2. **Permissions**: `ls -l` the config and data dirs → `700` dirs, `600` on `credentials.json` and
   `session.db{,-wal,-shm}`; nothing new created in the repo folder.
3. **Warm start**: restart → straight to the dialog list, no screens mounted.
4. **Env override**: `TUIGRAM_API_ID=… TUIGRAM_API_HASH=… ` with an empty config dir → skips the wizard.
5. **Phone fallback**: press `p` on the QR screen → phone/code/2FA path completes.
6. **Migration**: with a legacy `./client.session` and an empty data dir, the session moves and the user
   stays logged in.
7. **Logout**: `node bin/tuigram.js logout` → session files gone; next start shows the QR screen again.
8. **Packaging**: `npm pack --dry-run` shows no `.env`, session or log files; `npm i -g $(npm pack)` then
   `tuigram` from `$HOME` starts without the FFI flag on the command line.
9. **Screens without an account**: render `credentialsForm` and `qrLogin` headlessly with opentui's
   `createTestRenderer` to check layout and the QR half-block output.
10. `npm run lint` and `npm run fmt` clean (aside from the pre-existing errors).
