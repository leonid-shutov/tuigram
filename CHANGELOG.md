# Changelog

## [Unreleased]

### Added

- The pickers (chat search, the `?` key list, folders) move with `ctrl+n` / `ctrl+p` and `ctrl+j` / `ctrl+k`
  as well as the arrows, like fzf and Telescope, so your hands stay on the keyboard while you type.
  `PageUp` / `PageDown` move a page at a time, and `ctrl+Home` / `ctrl+End` jump to the first or last result.

## [1.1.0] - 2026-10-10

### Added

- `?` (or `alt+k` while typing) opens a searchable list of everything the focused pane can do, with
  every key bound to it; picking an entry runs it.
- The key hint bar now leads with the keys nobody would guess — edit, copy, search, attach, folders —
  and puts the obvious ones (`j/k`, `enter`, `tab`) last, so a narrow terminal drops those first.
  Opposite pairs share one hint (`j/k Move`, `gg/G Ends`, `h/l Album`), and Shift on a letter is written
  as its capital (`G`, not `shift+g`). Message scrolling is left to the bubble's own "hold shift to
  scroll" border.
- After the machine wakes from sleep, tuigram restarts itself to reconnect and reload your chats;
  `ctrl+r` does the same on demand.
- A check for a newer release at startup (registry.npmjs.org for npm installs, the Homebrew tap's formula
  for brew installs; never on a git checkout). A notice appears above the key hint bar when one is found:
  `alt+u` runs the upgrade and exits so you can restart into it, `alt+shift+u` dismisses it for the rest
  of the session. `tuigram upgrade` runs the same upgrade from the command line. Off with
  `"updateCheck": false` in `config.json` or `TUIGRAM_UPDATE=0`.
- Install from the Homebrew tap: `brew install leonid-shutov/tap/tuigram`. Every release bumps the formula
  right after it lands on npm; prereleases stay off Homebrew.
- `gg` and `G` jump to the ends: the first or last chat in the list, the oldest loaded or newest message
  in a chat. A long list no longer has to be walked with `j` and `k`.
- `J` and `K` (`Shift+j`, `Shift+k`) scroll a message that's too tall for the chat pane, line by line, instead of
  leaving the rest of it permanently hidden. Its border reads "hold shift to scroll" whenever there's
  more to see. A photo or video thumbnail shrinks first, down to a minimum, so a caption below a tall
  one keeps its own lines instead of being squeezed to a single scrollable one on a small screen.
- `Enter` on a message opens its media in the system viewer, and opens the message in the default browser
  when its text is nothing but an `http(s)` link.
- `e` on one of your own text messages reopens it in the message box for editing; `Enter` pushes the new
  text to Telegram, `Esc` cancels and restores whatever you were typing before.
- `Shift+Enter` starts a new line in the message box, and the box grows with it.
- Typing a search query into the chat picker now filters as you paste, not only as you type.
- Keys are handled by `@opentui/keymap`: bindings are declared once, per pane, and a pane's keys are
  live only while that pane has focus. Every binding is matched on the Latin key it sits on, so the
  whole keymap — not just `j` and `k` — works on a Cyrillic layout. `/` now reaches the chat search
  from the messages as well as the chat list.
- A forwarded message shows `↪ Forwarded from <name>` above its content, with the original sender's
  name colored the same way a group's sender names are.
- Chat folders: when your account has Telegram folders, `h` / `l` step between them in the chat list and
  `f` picks one from a searchable list.
- Albums show as one message; `h` / `l` flip through its pictures.
- `ctrl+o` in the message box attaches a file, picked from a netrw-style browser: `j` / `k` to move, `l` or
  `Enter` to open a folder or send the file, `h` or `-` to go up, `/` to filter.
- `y` (or `c`) copies the selected message's text to the clipboard, on terminals that support OSC 52.
- `ctrl+e` opens `config.json` in `$VISUAL` / `$EDITOR` (`vi` by default), pre-filled with the defaults
  if you don't have one yet. Saved changes apply as soon as the editor closes; `proxy` and
  `updateCheck` take effect on the next start.
- Errors show up on screen for a few seconds instead of only in the log; `alt+e` expands one to its
  detail, and dismisses it.
- The message list is split by day: `Today`, `Yesterday`, then the date.
- Unread counts in the chat list.
- The open chat's name and online status / last seen sit on the chat pane's top border.
- Calls render as messages instead of being skipped.
- `proxy` in `config.json`: `socks5://`, `socks4://`, `http(s)://`, or a `t.me/proxy?...` MTProxy link.
- `"hints": false` in `config.json` hides the key hint bar.
- Install with mise: `mise use -g node@26 npm:tuigram`.
- npm installs on Windows are recognized, so the update check and `alt+u` work there.
- Chat search finds chats typed on the wrong keyboard layout: `ghbdtn` matches `привет`, and the other way
  round.
- The 2FA password field accepts paste.

### Changed

- Installed copies sign in without any setup: no more registering an app at my.telegram.org first,
  the first launch goes straight to the QR code. If tuigram ever needs an API key of your own, it asks
  during sign-in — with step-by-step instructions — and carries on, no restart. A key you already set (in
  `credentials.json` or `TUIGRAM_API_ID` / `TUIGRAM_API_HASH`) keeps taking priority.
- A notification from a group now names the sender: the body reads `Timur: pushed the v9 tag` instead of
  just the message. Private chats and channels are unchanged — there the chat name is already the sender.
- Photo and video thumbnails download at up to 800px (was 320px), and are cached on disk under
  `$XDG_CACHE_HOME/tuigram` (default `~/.cache`) together with media opened in the system viewer, which
  used to go to the temp directory.
- The read receipt and status messages moved from the chat pane footer to its bottom border.
- History loads in pages of 50 messages and starts fetching the next one earlier, so holding `k` no
  longer stalls at the top; the chat list's first screen loads 25 chats at once.

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

[unreleased]: https://github.com/leonid-shutov/tuigram/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/leonid-shutov/tuigram/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/leonid-shutov/tuigram/releases/tag/v1.0.0
