# OpenTUI bugs and sharp edges

Findings against `@opentui/core@0.5.10`, turned up while making tuigram adapt to the terminal's
own colors. Rechecked against 0.8.4 on 2026-11-16 and again against 0.9.2 on 2026-11-17: the three
bugs are fixed upstream (see the end), and both sharp edges still hold, defaults included. The
"Checked, and fine" notes were not rechecked.

## Sharp edge: renderable defaults are hardcoded for a dark terminal

Not a bug, but the reason a partially-themed app silently reverts to dark. opentui ships a whole
system for staying palette-relative — `RGBA.fromIndex()`, `RGBA.defaultForeground()`,
`renderer.getPalette()`, `renderer.themeMode` — and then every renderable's own defaults are
literal RGB tuned for a dark background:

| Renderable           | Default                                                                                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Select`             | `focusedBackgroundColor: "#1a1a1a"`, `textColor`/`focusedTextColor: "#FFFFFF"`, `selectedBackgroundColor: "#334455"`, `selectedTextColor: "#FFFF00"`, `descriptionColor: "#888888"`, `selectedDescriptionColor: "#CCCCCC"` |
| `Box`                | `borderColor: "#FFFFFF"`, `focusedBorderColor: "#00AAFF"`                                                                                                                                                                  |
| `Textarea` / `Input` | `textColor: "#FFFFFF"`, `placeholderColor: "#666666"`, `cursorColor: white`                                                                                                                                                |
| `Text`               | `fg: "#FFFFFF"`                                                                                                                                                                                                            |
| ScrollBox bars       | track `#252527`, thumb `#9a9ea3`                                                                                                                                                                                           |

The trap: **every colour prop you don't pass reverts that one element to a dark theme.** That
is how the dialogs panel shipped black on a light terminal — `2-list.js` set seven colour props
and left `focusedBackgroundColor` out, so the focused panel painted `#1a1a1a`. There is no
warning and nothing looks wrong until someone runs a light terminal.

The rule this repo now follows: **set every colour prop on every renderable, or inherit none of
them.** `RGBA.defaultForeground()` / `defaultBackground()` would be strictly better library
defaults and would cost nothing.

## Sharp edge: `normalizeTerminalPalette(null)` fabricates a full palette

```
normalize(null).defaultBackground = #000000 | fg = #ffffff
palette length = 256 | slot 4 = #000080 | slot 8 = #808080
```

There is no failure signal in the return value — it has exactly three keys, all populated. On a
terminal that ignores OSC queries, `getPalette()` _resolves_ rather than rejecting, with every
field `null`; feeding that straight into `normalizeTerminalPalette` invents a black-background
theme, so you would derive a dark palette on a light terminal and never find out.

You can tell, but only upstream of the normalize call, by checking the raw result (still true in
0.8.4; tuigram no longer detects the terminal's palette, so nothing here depends on it):

```js
const detected = colors.defaultBackground === null ? null : tui.normalizeTerminalPalette(colors);
```

## Checked, and fine

- **Blank cells outside a partial-width renderable get `38;2;255;255;255`** rather than SGR 39.
  Inconsistent with the colour-intent system, but invisible — they are spaces on a default
  background — and a completely empty renderer emits no colour codes at all.
- **`@opentui/qrcode` defaults to black-on-white and ignores the terminal theme.** Correct as
  is: inverted QR codes fail on many phone scanners, so this one _should_ be theme-independent.

## Fixed upstream

Rechecked against `@opentui/core@0.8.4` on 2026-11-16 with each entry's original repro; all three
are fixed there, and tuigram's workaround for each is gone.

- **`scrollbarOptions: { visible: false }` was reverted once content overflowed** (found in
  0.5.10: the base constructor wrote `_visible` directly, bypassing the bar's own setter). The
  chat had to assign `verticalScrollBar.visible = false` after construction. 0.8's bars keep an
  explicit `visible`, so the chat's ScrollBox now just passes it in `verticalScrollbarOptions`.
  With `scrollX: false` the horizontal bar no longer shows while content is short, either.
- **`createCliRenderer({ backgroundColor })` was never read** (0.5.10: only `setBackgroundColor`
  wrote it). `src/02-screen/1-renderer.js` passes the option now instead of calling the setter.
- **A `Textarea` came out up to 2 cells wider than a parent placed by percentage** (0.5.17: Yoga's
  text rounding for measured nodes). `SearchList` wrapped its input in a clipping 1-row box; the
  input and the list under it now come out the same width at every terminal width tried (80,
  97–103 and 120 columns), so the wrapper is gone.
