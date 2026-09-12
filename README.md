# 📟 tuigram — Telegram Terminal UI Client

A lightweight, terminal-based Telegram client written in **Node.js** with Vim-flavored navigation.

## Install

```sh
brew install leonid-shutov/tap/tuigram
```

or from npm, which needs a Node.js 26.4 or newer of your own:

```sh
npm install -g tuigram
```

Then run `tuigram`.

## First run

tuigram does not ship Telegram API credentials — every user registers their own pair, and it
is tied to your account, so never share it:

1. open <https://my.telegram.org> and log in
2. choose **API development tools** and create an app
3. copy the `api_id` and `api_hash`

The first launch asks for them in the TUI and saves them. Then it shows a QR code: open
Telegram on your phone → **Settings → Devices → Link Desktop Device** and scan it. Press `p`
on that screen to sign in with a phone number and code instead. Later launches reuse the
stored session and go straight to your chats.

You can skip the prompt by setting the credentials in the environment instead:

```sh
export TUIGRAM_API_ID=1234567
export TUIGRAM_API_HASH=0123456789abcdef0123456789abcdef
```

## Keys

| Key                     | Does                                                     |
| ----------------------- | -------------------------------------------------------- |
| `Tab` / `Shift+Tab`     | cycle chat list → messages → message box                 |
| `1` `2` `3`             | jump straight to a pane (not while typing)               |
| `alt+1` `alt+2` `alt+3` | the same, and works while typing                         |
| `ctrl+p`                | fuzzy chat search — from anywhere, including mid-message |
| `/`                     | fuzzy chat search — from the chat list                   |
| `j` / `k` / `↑` / `↓`   | move through chats and messages                          |
| `Enter`                 | open the selected chat, or send the message              |
| `Esc`                   | leave the message box; close the search                  |
| `ctrl+c`                | quit                                                     |

`о` and `л` are bound alongside `j` and `k`, so navigation keeps working without switching away
from a Cyrillic layout.

## What is covered

- QR sign-in in the terminal, with phone + code and a 2FA password as fallbacks
- Live incoming messages, sending plain text, and read-state sync in both directions
- A read/unread receipt for your own last message, in the chat pane footer
- Inline photo and video thumbnails — the stripped thumbnail travels inside the message and draws
  instantly, then the 320px version downloads in the background
- Rich previews for ~18 media types, in the chat list and in the message pane
- Fuzzy chat search
- Desktop notifications; muted chats stay quiet
- Per-sender name colors in groups, and a stable per-chat emoji glyph
- Endless upward history paging
- 15 themes that paint their own background, so they look the same on any terminal

## Configuration

Optional, and read from `$XDG_CONFIG_HOME/tuigram/config.json`:

```json
{
  "theme": "aqua-lime",
  "imageProtocol": "auto",
  "dialogEmoji": true
}
```

| Key             | Default     | Values                                                                                                                                                                                         |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`         | `aqua-lime` | `tokyo-night`, `blue-green`, `aqua-lime`, `daylight`, `nord`, `gruvbox`, `catppuccin`, `dracula`, `rose-pine`, `solarized-dark`, `mono`, `high-contrast`, `crt-amber`, `y2k`, `ascii-terminal` |
| `imageProtocol` | `auto`      | `auto`, `kitty`, `sixel`, `blocks`, `off`                                                                                                                                                      |
| `dialogEmoji`   | `true`      | `true`, `false` — turn off on fonts with no emoji coverage                                                                                                                                     |

`daylight` is the light theme. `ascii-terminal` draws its borders out of `+`, `-` and `|` for fonts
without box-drawing glyphs. Unknown keys are ignored, and a file that fails to parse falls back to
the defaults.

## Files

| What            | Where                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Settings        | `$XDG_CONFIG_HOME/tuigram/config.json` (default `~/.config`)                                  |
| API credentials | `$XDG_CONFIG_HOME/tuigram/credentials.json` — mode `0600`                                     |
| Session         | `$XDG_DATA_HOME/tuigram/session.db` (default `~/.local/share`) — mode `0600`                  |
| Log             | `$XDG_STATE_HOME/tuigram/tuigram.log` (default `~/.local/state`), override with `TUIGRAM_LOG` |

## Commands

```sh
tuigram            # start
tuigram logout     # revoke the session and delete it locally
tuigram --help
tuigram --version
```

## Development

```sh
npm install
npm run dev
npm run lint
npm run types
npm run fmt
```
