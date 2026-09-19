# config.json versioning: scenarios

The reasoning behind this design is in
[`docs/decisions/0001-config-schema-versioning.md`](decisions/0001-config-schema-versioning.md).
This doc walks through what actually happens on disk and in `tuigram.log` for the cases that
motivated it.

## Scenario 1: fresh install

No `config.json` exists yet.

```
$ ls $XDG_CONFIG_HOME/tuigram/
credentials.json
```

Nothing is read, nothing is written. `config.theme`, `config.hints`, `config.dialogEmoji`,
`config.imageProtocol` all resolve to their schema defaults. `config.json` is created for the
first time only when the user opens it via `ctrl+e` and their editor saves it.

## Scenario 2: hand-written file, nothing to migrate (the common case)

```json
// config.json, as written by the user
{
  "theme": "nord",
  "hints": false
}
```

Nothing here is invalid and nothing is unknown, so nothing is logged. The migrations list is empty
(see Scenario 4 for what a real entry looks like), so `migrate()` reports `changed: false` and the
file is never rewritten — it stays byte-for-byte what the user wrote.

`config.theme`/`config.hints` resolve to `nord`/`false` exactly as written.

## Scenario 3: a typo and an unknown key

```json
// config.json, as written by the user
{
  "theme": "aqua-lime",
  "hints": "nope",
  "typoo": true
}
```

`tuigram.log`:

```
[config] invalid value for "hints" in /home/user/.config/tuigram/config.json, using default
[config] unknown key "typoo" in /home/user/.config/tuigram/config.json, ignored
```

No migration applies here either, so the file on disk is never rewritten at all — their typo stays
visible, byte-for-byte what they wrote, so they can find and fix it rather than having it silently
deleted:

```json
{
  "theme": "aqua-lime",
  "hints": "nope",
  "typoo": true
}
```

In memory, `config.hints` falls back to its default (`true`); `typoo` is never read by anything.

## Scenario 4: the bug this design avoids

Say a future release wants to nest `imageProtocol` under an `image` object — `image.protocol`
instead of a flat key. A tempting way to write that migration is to key it by an external version
counter, the way redux-persist or electron-store do — tuigram has no such counter (see ADR 0001),
but it's worth seeing why that would go wrong if one were added back later:

```js
// NOT what tuigram does — shown to illustrate why not
{
  version: 2, // some hypothetical stored/compared version number
  up: (source) => ({ ...source, image: { protocol: source.imageProtocol }, imageProtocol: undefined }),
}
```

A user who never saw the old `imageProtocol` key — they installed after this shipped and copied
the *current* docs — writes exactly the new shape:

```json
// config.json, as written by the user, correct per current docs
{
  "image": { "protocol": "kitty" }
}
```

That's already current — no migration should touch it. But a version-counted design has to run
migrations based on whatever external signal told it "you're behind, catch up to v2" — and once
that signal fires, the migration above doesn't check whether `imageProtocol` is actually there. It
just reads it (`undefined`, since this file never had that key) and overwrites the real value:

```json
// config.json, written back — WOULD happen under a version-counted migration
{
  "image": { "protocol": undefined }
}
```

The user's `kitty` setting is gone, silently, on the very first launch that includes this
migration.

**What tuigram actually does**: the real migration checks for its own precondition — the *old*
key's presence — before transforming anything, and needs no version signal to decide whether to
run at all:

```js
(source) =>
  'imageProtocol' in source && !('image' in source)
    ? { ...source, imageProtocol: undefined, image: { protocol: source.imageProtocol } }
    : source, // already current (or already migrated) — leave it alone
```

Against the same file, `'imageProtocol' in source` is `false`, so `up` returns the input
unchanged. `migrate()` reports nothing changed, and the file is never rewritten:

```json
{
  "image": { "protocol": "kitty" }
}
```

Nothing is lost.

## Scenario 5: a genuinely old file still migrates correctly

The same self-gating migration still does its job for a file that actually predates it:

```json
// config.json, written before the image.protocol rename ever existed
{
  "imageProtocol": "kitty"
}
```

Here `'imageProtocol' in source && !('image' in source)` is `true`, so `up` fires. Before the
rewrite, the file as it was is copied to `config.json.bak` — a rolling backup, overwritten on
every migrating write, that holds whatever was on disk immediately before the most recent one:

```json
// config.json.bak, written just before the rewrite below
{
  "imageProtocol": "kitty"
}
```

```json
// config.json, after migrating
{
  "image": { "protocol": "kitty" }
}
```

The mechanism handles both directions with the same rule — transform only when the old marker is
actually there — without needing any version number to tell it which case it's looking at.

`config.json.bak` only exists once a migration has actually fired at least once — Scenarios 1-3
above never touch it, since nothing there is `changed`.
