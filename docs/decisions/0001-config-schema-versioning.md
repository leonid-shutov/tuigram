# ADR 0001: config.json schema migrations, without a version field

## Status

Accepted.

## Context

`config.json` (`$XDG_CONFIG_HOME/tuigram/config.json`) is optional and hand-edited — there's no
UI for it, users open it in `$EDITOR` (`ctrl+e`) and write JSON directly. tuigram has no real
users yet, which made this the moment to work out how its shape can safely evolve later, before
any config file existed in a shape we'd later have to keep supporting.

Drafting this, the obvious approach was to key migrations by that `version` number the same way
tools like redux-persist and electron-store do: treat a missing `version` as "version 0," and
replay every migration from 0 up to `CURRENT_VERSION` in order, each one assuming it receives
exactly the shape the previous version produced. That approach was caught during design, before
any of this shipped — see below.

That assumption doesn't hold here. redux-persist and electron-store only ever read a `version`
back from a file *they themselves last wrote* — the number is trustworthy because nothing else
touches the file. `config.json` is different: a user can write a file matching the current docs
at any time and simply not include `version`, because the README never shows it (it's described
as automatic). That file isn't old — it's current, just unstamped. Replaying every migration
against it anyway can corrupt real values. See `docs/CONFIG_VERSIONING.md` for the worked example.

## Options considered

- **Kubernetes' `apiVersion`**: mandatory, no default. A resource missing it is rejected outright
  — the ambiguity is avoided by refusing to guess. Rejected here as too harsh for a small,
  hand-edited settings file: every other field in this file already degrades gracefully (an
  invalid `theme` value logs a warning and falls back, it doesn't stop the app from booting), and
  making `version` alone a hard requirement would be inconsistent with that.

- **Version-counted replay** (redux-persist, electron-store): the approach drafted initially, before
  this shipped. Correct for files that only ever round-trip through the app itself; unsafe for
  files that are hand-authored against current docs, which is tuigram's actual usage pattern.

- **Structural validation, version as bookkeeping only** (Docker Compose, after Compose V2):
  Compose's `version:` key was originally meant to select a schema, caused enough real-world
  breakage from stale/missing/wrong version numbers that Compose now always validates against the
  most current schema and treats `version` as informational only. **Chosen.**

## Prior art: existing config-migration libraries

Surveyed before settling on a hand-rolled `migrate.js` (~30 lines):

- [`conf`](https://github.com/sindresorhus/conf) (the library `electron-store` wraps) has a
  `migrations` option keyed by version, replaying a chain against a version it stores internally.
  Its own README opens that section with: "**Important: I cannot provide support for this
  feature. It has some known bugs. I have no plans to work on it.**"
  [Issue #92](https://github.com/sindresorhus/conf/issues/92) shows a real bug in exactly this
  area (the internal version was stored as `1.0.0` instead of the declared `0.0.1`).
- [`json-up`](https://github.com/Nano-Collective/json-up) and `redux-persist` use the same
  version-counted-replay shape as the rejected option above; their docs don't address a
  missing/incorrect version field.
- [`convict`](https://github.com/mozilla/node-convict) validates a schema (with a strict mode that
  rejects undeclared keys) but has no migration story — it doesn't help evolve a shape over time.
- [`verzod`](https://github.com/AndrewBastin/verzod) fails closed: you supply a `getVersion(data)`
  function, and if it can't find one, the library refuses rather than guesses — the Kubernetes
  option above, at library scope.
- [`zod-migrate`](https://github.com/tone-row/zod-migrate) is the one library found that doesn't
  trust a stored version at all — it tests data against each version's Zod schema with
  `safeParse()`, working backward until one matches, then migrates forward. This independently
  validates the structural-detection principle this ADR uses, though it's Zod-specific (tuigram
  has no Zod dependency) and its own docs don't define what happens when data matches multiple
  schema versions.

No library surveyed was an obvious drop-in replacement for the ~30 lines this ADR specifies, and
the most mainstream one has an open, maintainer-acknowledged bug in exactly the area this ADR is
about — which is itself evidence this problem is easy to get wrong even for well-used libraries.
Notably, every one of them — including `zod-migrate`, `verzod`, and Compose's own `version:` key —
still keeps *some* stored or supplied version identifier around, even the ones that don't trust it
for parsing. tuigram goes one step further, below: once migrations don't need it, it drops the
field entirely rather than keeping an inert one.

## Decision

1. Migrations never key off a stored version number. Whatever `migrate()` receives, it just runs
   every migration in the list against it.
2. Per-field structural validation (`schema.js`) is the actual source of truth for whether a value
   is usable, exactly as Compose validates structurally regardless of any declared version. This
   part of the design was already correct and is unchanged.
3. Every migration must follow Fowler's expand/contract discipline: check for its own old-shape
   marker before transforming, and return the input unchanged (same object reference) when that
   marker isn't present. This is what makes replaying the whole list safe against a file in *any*
   actual shape — genuinely old files still get migrated (their marker is really there), and
   current files that merely look old are left alone (the marker never matches).
4. The migrations list starts empty. There is nothing to migrate from yet.

### No `version` field at all

The original draft of this decision still kept a `version` field in `config.json`, bumped by
`migrate()` and stamped on every file, purely for bookkeeping — the idea being it's harmless and
maybe useful for support later. It isn't harmless: once migrations are self-gating and structural
(points 1–3 above), a version number plays no role in deciding what runs. It becomes pure
decoration — except it wasn't quite inert. Every file missing it (which was *every* hand-written
file, since the README never showed it) got treated as "changed" and silently rewritten to disk on
first boot, reformatted, just to add a number nothing reads. That's a real, user-visible side
effect (a file the user didn't touch shows up as modified in their dotfiles repo) in exchange for
a field with no function.

tuigram has no installed base depending on a version field the way Docker Compose's ecosystem did
when Compose made `version:` ignorable rather than removing it outright — there's nothing here to
stay compatible with. So the field is dropped entirely rather than kept-but-inert. If a concrete
need shows up later (a real migration that benefits from a hint about where to start, or a support
workflow that wants to see "what shape did you write"), it can be added the same way any other
field would be, once something actually needs it.

## Related: don't materialize defaults on first boot

A natural-seeming extension of this design is to write a `config.json` full of default values the
first time tuigram runs, so the file always exists and is self-documenting. Considered and
rejected: it's the same mistake this ADR is about, in miniature.

The whole point of leaving a field absent is that its meaning — "whatever tuigram currently
considers best" — tracks future default changes automatically. Writing `{ theme: "aqua-lime", ... }`
into every fresh install turns that meaning into "the user chose aqua-lime," permanently and
indistinguishably from an actual choice. Changing a default later would then either drift (old
installs silently keep the old default forever, defeating the point of changing it) or require its
own migration just to update a value nobody actually asked for — the same "absent isn't nothing"
mistake that caused the corruption in `docs/CONFIG_VERSIONING.md`'s Scenario 4.

`config.json` stays absent until the user's editor actually creates it via `ctrl+e`
(`src/08-actions/openConfig.js`), same as today.

A cheaper way to get the discoverability this idea was after, without the downside: have
`openConfig.js` seed the editor buffer with the *current resolved* values when no file exists yet,
so the user sees what's editable immediately — but only persist that if they actually save, and
only that one time, never re-written on every boot. Not implemented; noted here for whoever picks
it up.

## Consequences

- A future migration is slightly more work to write than a naive transform (it must check a
  precondition, not just reshape), but this is a one-time cost per migration, paid once.
- No field exists for a human to glance at and know "what shape did this file have when it was
  last touched." If that's ever wanted, it has to be reconstructed some other way (e.g. asking a
  user to paste their `config.json` directly) rather than reading a stamped number.
- A `config.json` that needs no migration is never rewritten — editing it by hand and never
  touching `ctrl+e` again means the file never changes out from under the user.
- No test suite exists in this repo to pin this behavior down automatically; regressions here are
  currently only caught by manual verification (see `docs/CONFIG_VERSIONING.md`).

## References

- [Version and name top-level elements — Docker Docs](https://docs.docker.com/reference/compose-file/version-and-name/)
- [Parallel Change (expand/contract) — Encyclopedia of Agentic Coding Patterns](https://aipatternbook.com/parallel-change)
- [redux-persist migrations.md](https://github.com/rt2zz/redux-persist/blob/master/docs/migrations.md)
- [electron-store readme (migrations)](https://github.com/sindresorhus/electron-store/blob/main/readme.md)
