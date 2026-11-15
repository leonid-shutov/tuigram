# Contributing to tuigram

Thanks for taking a look. Bug reports, fixes, features, themes and docs are all welcome — open a
pull request, or an issue if you'd like to talk something through first.

## Setting up

You need Node.js 26.4 or newer. With [mise](https://mise.jdx.dev), `mise install` in the repo
picks up the version from `mise.toml`.

```sh
git clone https://github.com/leonid-shutov/tuigram.git
cd tuigram
npm install
npm run dev
```

**A git checkout has no Telegram app key.** Released packages ship one; the repo doesn't. So the
first `npm run dev` asks for an `api_id` and `api_hash` of your own — the README's
[Using your own API key](README.md#using-your-own-api-key) shows how to get one in a minute.

`npm run dev` uses the same config, session and log as an installed tuigram. To keep them apart,
give the dev copy its own directories:

```sh
export XDG_CONFIG_HOME=~/tuigram-dev/config XDG_DATA_HOME=~/tuigram-dev/data
export XDG_STATE_HOME=~/tuigram-dev/state XDG_CACHE_HOME=~/tuigram-dev/cache
npm run dev
```

The renderer owns the terminal, so `console.log` goes to the log file:
`$XDG_STATE_HOME/tuigram/tuigram.log` (or wherever `TUIGRAM_LOG` points). `tail -f` it in a
second terminal.

## Finding your way around

`src/` has no imports: the directory tree is the wiring. Read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before your first change — it's short, and it
explains how files become modules and which layer does what.

## Checks

CI runs all four on every pull request:

```sh
npm run fmt:check   # Prettier; `npm run fmt` fixes it
npm run lint        # ESLint
npm run types       # tsc over src/, via JSDoc
npm test            # the integration tests
```

## Tests

Every test boots the whole app against a fake Telegram and a headless terminal, presses keys, and
checks what's on screen. There are no unit tests, and nothing in `src/` gets mocked — a new test
drives the app the way a user would. [docs/TESTING.md](docs/TESTING.md) shows how to write one.

A bug fix should come with a test that fails without it, where the test world can reach the bug.

## Pull requests

- Keep one change per pull request; a fix and an unrelated refactor are easier to review apart.
- For anything a user would notice, add a line under `## [Unreleased]` in
  [CHANGELOG.md](CHANGELOG.md), written for users rather than developers.
- If you change a key, a config option or a file location, update the README's tables too.
- Commit messages are short, lowercase and say what the change does, like `run the tests in ci`.

## Reporting a bug

Open an [issue](https://github.com/leonid-shutov/tuigram/issues) with `tuigram --version`, how
you installed it, your OS and terminal, and what you did and saw. The log
(`~/.local/state/tuigram/tuigram.log` by default) usually says what went wrong; read it for
anything private before you attach it.

Security problems go through [SECURITY.md](SECURITY.md) instead, not a public issue.

## Licence

By contributing you agree that your work is released under the [MIT License](LICENSE).
