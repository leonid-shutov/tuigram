# 📟 tuigram — Telegram Terminal UI Client

A lightweight, terminal-based Telegram client written in **Node.js** with Vim-flavored navigation.

<img width="2880" height="1845" alt="image" src="https://github.com/user-attachments/assets/bbd6cd2e-89b5-403c-b340-dd113d081301" />

## Install

```sh
brew install leonid-shutov/tap/tuigram
```

or with [mise](https://mise.jdx.dev), which installs Node.js 26 alongside it:

```sh
mise use -g node@26 npm:tuigram
```

or on Arch, from the [AUR](https://aur.archlinux.org/packages/tuigram):

```sh
yay -S tuigram
```

or from npm, which needs a Node.js 26.4 or newer of your own:

```sh
npm install -g tuigram
```

Then run `tuigram`.

## First run

The first launch shows a QR code: open Telegram on your phone → **Settings → Devices → Link
Desktop Device** and scan it. Press `p` on that screen to sign in with a phone number and code
instead. Later launches reuse the stored session and go straight to your chats.

### Using your own API key

1. open <https://my.telegram.org> and log in
2. choose **API development tools**
3. fill in any app title and short name, e.g. `tuigram`
4. copy the `api_id` and `api_hash` shown on the next page

tuigram saves them to `credentials.json` (see [Files](#files)) and uses them from then on. Your
own key always takes priority, so you can also supply it upfront — in that file, or in the
environment:

```sh
export TUIGRAM_API_ID=1234567
export TUIGRAM_API_HASH=0123456789abcdef0123456789abcdef
```

## Keys

| Key                               | Does                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `Tab` / `Shift+Tab`               | cycle chat list → messages → message box                                               |
| `1` `2` `3`                       | jump straight to a pane (not while typing)                                             |
| `alt+1` `alt+2` `alt+3`           | the same, and works while typing                                                       |
| `ctrl+p`                          | fuzzy chat search — from anywhere, including mid-message                               |
| `/`                               | fuzzy chat search — from the chat list or the messages                                 |
| `?`                               | list the focused pane's keys, searchable; picking one runs it                          |
| `alt+k`                           | the same, and works while typing                                                       |
| `j` / `k` / `↑` / `↓`             | move through chats and messages                                                        |
| `J` / `K` / `Shift+↑` / `Shift+↓` | scroll a message too tall for the pane (its border reads "hold shift to scroll")       |
| `gg` / `G`                        | jump to the first / last chat, or oldest / newest message                              |
| `Enter`                           | open the selected chat, open the selected message's media or link, or send the message |
| `e`                               | edit the selected message, if it's yours                                               |
| `Shift+Enter`                     | start a new line in the message box                                                    |
| `Esc`                             | leave the message box; cancel an edit; close the search                                |
| `alt+u`                           | upgrade tuigram, once a newer release is available                                     |
| `alt+shift+u`                     | dismiss that update notice                                                             |
| `ctrl+c`                          | quit                                                                                   |

Every binding is matched on the Latin key it sits on, so the whole keymap keeps working on a
Cyrillic layout without switching back — `о` moves down, `пп` is `gg`, and so on.

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
- A once-a-day check for a newer release, with a one-key upgrade (`alt+u`)

## Configuration

Optional, and read from `$XDG_CONFIG_HOME/tuigram/config.json`:

```json
{
  "theme": "aqua-lime",
  "imageProtocol": "auto",
  "dialogEmoji": true,
  "hints": true,
  "proxy": "socks5://user:pass@host:port",
  "updateCheck": true
}
```

| Key             | Default     | Values                                                                                                                                                                                         |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`         | `aqua-lime` | `tokyo-night`, `blue-green`, `aqua-lime`, `daylight`, `nord`, `gruvbox`, `catppuccin`, `dracula`, `rose-pine`, `solarized-dark`, `mono`, `high-contrast`, `crt-amber`, `y2k`, `ascii-terminal` |
| `imageProtocol` | `auto`      | `auto`, `kitty`, `sixel`, `blocks`, `off`                                                                                                                                                      |
| `dialogEmoji`   | `true`      | `true`, `false` — turn off on fonts with no emoji coverage                                                                                                                                     |
| `hints`         | `true`      | `true`, `false` — set to false to hide the key hint bar and reclaim its row                                                                                                                    |
| `proxy`         | _(none)_    | a proxy URL — `socks5://`, `socks4://`, `http://`/`https://`, or a `t.me/proxy?...` MTProxy link; connects directly if unset                                                                   |
| `updateCheck`   | `true`      | `true`, `false` — check registry.npmjs.org (npm/mise), the tap's formula (brew), or the AUR at startup                                                                                         |

`daylight` is the light theme. `ascii-terminal` draws its borders out of `+`, `-` and `|` for fonts
without box-drawing glyphs. Unknown keys and invalid values are ignored — each falls back to its
default — and a file that fails to parse falls back to the defaults entirely; either way, a line
is logged to `tuigram.log` (see Files below) so a typo doesn't go unnoticed.

### Update checks

At startup, tuigram asks registry.npmjs.org (npm and mise installs), the
`leonid-shutov/homebrew-tap` formula on GitHub (brew installs), or aur.archlinux.org (AUR
installs) whether a newer release exists — never anything more, and never on a git checkout. When
one is found, `alt+u upgrade to <version>` appears in its own row above the key hint bar (so it
shows even with `hints: false`); `alt+u` runs the upgrade in place and exits so you can restart
into it (on the AUR it instead shows the command to run with your own AUR helper, since only that
helper should touch pacman's files), `alt+shift+u` dismisses that version for the rest of the
session (it resurfaces on the next restart, since nothing is written to disk). Set
`"updateCheck": false` in
`config.json` to turn the check off entirely; `tuigram upgrade` runs it from the command line
instead, without starting the TUI.

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
tuigram upgrade    # check for and install a newer release
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
