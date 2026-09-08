# 📟 tuigram — Telegram Terminal UI Client

A lightweight, terminal-based Telegram client written in **Node.js** with a primary focus on **Vim motions**.

<img width="3840" height="2160" alt="obraz" src="https://github.com/user-attachments/assets/335b2934-ea6e-4c8b-9ae4-c8f3f89c78d0" />

## Install

```sh
npm install -g tuigram
tuigram
```

Node.js 26.4 or newer is required.

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

## Colors

tuigram has no themes of its own. Every color it draws is one of three things: an ANSI palette
slot, your terminal's default foreground or background, or a blend of those two — so it takes
on whatever theme your terminal is already wearing, light or dark, and follows along when you
switch. Panels borrow slot 8 for their frames and the blue slot when focused; a slot that would
disappear into your background is detected and replaced.

## Settings

`$XDG_CONFIG_HOME/tuigram/config.json`, all keys optional:

| Key             | Default     | What it does                                                                               |
| --------------- | ----------- | ------------------------------------------------------------------------------------------ |
| `dialogEmoji`   | `true`      | Peer glyphs in the dialogs list and chat header. Turn off on fonts with no emoji coverage. |
| `imageProtocol` | `'auto'`    | How bubbles draw thumbnails: `auto`, `kitty`, `sixel`, `blocks`, or `off`.                 |
| `borderStyle`   | `'rounded'` | Frame style: `rounded`, `heavy`, `single`, or `double`.                                    |
| `asciiBorders`  | `false`     | Draw frames with `+ -                                                                      | ` instead of box-drawing glyphs. |
| `panelWidth`    | `30`        | Width of the dialogs panel, in cells.                                                      |

## Files

Nothing is ever written to the working directory.

| What            | Where                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------- |
| Settings        | `$XDG_CONFIG_HOME/tuigram/config.json` (default `~/.config`)                                  |
| API credentials | `$XDG_CONFIG_HOME/tuigram/credentials.json` — mode `0600`                                     |
| Session         | `$XDG_DATA_HOME/tuigram/session.db` (default `~/.local/share`) — mode `0600`                  |
| Log             | `$XDG_STATE_HOME/tuigram/tuigram.log` (default `~/.local/state`), override with `TUIGRAM_LOG` |

The session database is an unencrypted account credential — treat it like a password.

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
npm run dev        # reads .env if present (API_ID / API_HASH)
npm run lint
npm run types
npm run fmt
```
