# Changelog

## [Unreleased]

### Added

- Install from the Homebrew tap: `brew install leonid-shutov/tap/tuigram`. Every release bumps the formula
  right after it lands on npm; prereleases stay off Homebrew.
- `gg` and `G` jump to the ends: the first or last chat in the list, the oldest loaded or newest message
  in a chat. A long list no longer has to be walked with `j` and `k`.
- `Shift+Enter` starts a new line in the message box, and the box grows with it.
- Typing a search query into the chat picker now filters as you paste, not only as you type.
- Keys are handled by `@opentui/keymap`: bindings are declared once, per pane, and a pane's keys are
  live only while that pane has focus. Every binding is matched on the Latin key it sits on, so the
  whole keymap — not just `j` and `k` — works on a Cyrillic layout. `/` now reaches the chat search
  from the messages as well as the chat list.

### Fixed

- Sending a message scrolls the chat to the very bottom, so the message you just sent is visible even when
  you had scrolled up into history. The cursor moves to it, and the message box keeps its own cursor while
  you keep typing.

## [1.0.0] - 2026-09-12

First public release.

### Added

- Install from npm (`npm install -g tuigram`, Node.js 26.4 or newer) and run with `tuigram`;
  `tuigram logout` revokes the session and deletes it locally.
- QR sign-in in the terminal, with phone number + code and a 2FA password as fallbacks. Credentials are
  your own `api_id`/`api_hash`, asked for once in the TUI or taken from `TUIGRAM_API_ID` /
  `TUIGRAM_API_HASH`, and later launches reuse the stored session.
- Three panes — chat list, messages, message box — with Vim-flavored navigation: `Tab` / `Shift+Tab` to
  cycle, `1` `2` `3` (and `alt+1` `alt+2` `alt+3`, which work while typing) to jump, `j` / `k` to move.
  `о` and `л` are bound alongside `j` and `k`, so navigation keeps working on a Cyrillic layout.
- Live incoming messages, sending plain text, and read-state sync in both directions.
- A read/unread receipt for your own last message, in the chat pane footer.
- Inline photo and video thumbnails — the stripped thumbnail travels inside the message and draws
  instantly, then the 320px version downloads in the background.
- Rich previews for ~18 media types, in the chat list and in the message pane.
- Fuzzy chat search: `ctrl+p` from anywhere, including mid-message, or `/` from the chat list.
- Desktop notifications for chats you are not looking at; muted chats stay quiet.
- Per-sender name colors in groups, and a stable per-chat emoji glyph.
- Endless upward history paging.
- 15 themes that paint their own background, so they look the same on any terminal — `daylight` is the
  light one, `ascii-terminal` draws its borders out of `+`, `-` and `|`.
- Optional `$XDG_CONFIG_HOME/tuigram/config.json` with `theme`, `imageProtocol` (`auto`, `kitty`, `sixel`,
  `blocks`, `off`) and `dialogEmoji`. Unknown keys are ignored, and a file that fails to parse falls back
  to the defaults.

Supersedes the `1.0.0-alpha.*` series, which is not itemized here.

[unreleased]: https://github.com/leonid-shutov/tuigram/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/leonid-shutov/tuigram/releases/tag/v1.0.0
