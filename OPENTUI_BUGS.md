# OpenTUI bugs and sharp edges

Findings against `@opentui/core@0.5.10`, turned up while making tuigram adapt to the terminal's
own colors. Bundle line numbers are for that exact version; each one comes with the grep that
finds it again.

## Bug: `scrollbarOptions: { visible: false }` is silently reverted

A typed, documented option that works for exactly as long as the content fits, then undoes
itself the first time the content overflows — which is the only time a scrollbar would have
shown anyway, so in practice it never works at all.

`src/6-ui/chat/3-scroll.js:17` asks for no scrollbar. The chat pane draws one regardless: a
`#252527` track down its right edge, near-black on any terminal.

### Repro

```js
const box = new ScrollBoxRenderable(r, {
  width: 30,
  height: 5,
  scrollY: true,
  scrollbarOptions: { visible: false },
});
r.root.add(box);
console.log(box.verticalScrollBar.visible); // false
for (let i = 0; i < 20; i++) box.add(new TextRenderable(r, { content: `line ${i}` }));
// after a frame:
console.log(box.verticalScrollBar.visible); // true  <- reverted
box.verticalScrollBar.visible = false;
console.log(box.verticalScrollBar.visible); // false <- sticks
```

```
right after construction : false
after content overflows  : true
after assigning .visible : false
```

### Cause

`ScrollBarRenderable` records whether visibility was chosen by the caller, and only its setter
sets that flag (`index.node.js:13605`, `grep -n "_manualVisibility" index.node.js`):

```js
set visible(value) { this._manualVisibility = true; super.visible = value; }

recalculateVisibility() {                             // index.node.js:13769
  if (!this._manualVisibility) {
    const sizeRatio = this.scrollSize <= this.viewportSize ? 1 : this.viewportSize / this.scrollSize;
    super.visible = sizeRatio < 1;
  }
}
```

But the base `Renderable` constructor writes the backing field directly, bypassing the
subclass setter (`chunk-node-6bg8r2m7.js:255`, `grep -n "_visible = options.visible"`):

```js
this._visible = options.visible !== false;
```

So the constructor path leaves `_manualVisibility === false`, and the first
`scrollSize`/`viewportSize` assignment — which `ScrollBoxRenderable.recalculateBarProps()` does
on every size change — calls `recalculateVisibility()` and overwrites the caller's choice.

This is not specific to scrollbars. **Any `Renderable` subclass that overrides the `visible`
setter to attach behavior will have that behavior skipped for the constructor's `visible`
option**, because construction never routes through the setter.

### Workaround

Assign after construction, so it goes through the setter:

```js
self.scroll.verticalScrollBar.visible = false;
```

We have not applied this — hiding the bar is a behavior decision, and the color problem is
fixed independently by giving the track and thumb adaptive colors in `3-scroll.js`. If you do
want it gone, the line above is the whole fix.

### Suggested upstream fix

Either route the constructor through the setter, or have `ScrollBarRenderable` set
`_manualVisibility` when `visible` is explicitly present in its options:

```js
this._manualVisibility = options.visible !== undefined;
```

---

## Sharp edge: renderable defaults are hardcoded for a dark terminal

Not a bug, but the reason a partially-themed app silently reverts to dark. 0.5.x ships a whole
system for staying palette-relative — `RGBA.fromIndex()`, `RGBA.defaultForeground()`,
`renderer.getPalette()`, `renderer.themeMode` — and then every renderable's own defaults are
literal RGB tuned for a dark background:

| Renderable           | Default                                                                                                                                                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Select`             | `focusedBackgroundColor: "#1a1a1a"`, `textColor`/`focusedTextColor: "#FFFFFF"`, `selectedBackgroundColor: "#334455"`, `selectedTextColor: "#FFFF00"`, `descriptionColor: "#888888"`, `selectedDescriptionColor: "#CCCCCC"` |
| `Box`                | `borderColor: "#FFFFFF"`, `focusedBorderColor: "#00AAFF"`                                                                                                                                                                  |
| `Textarea` / `Input` | `textColor: "#FFFFFF"`, `placeholderColor: "#666666"`, `cursorColor: white`                                                                                                                                                |
| `Text`               | `fg: "#FFFFFF"`                                                                                                                                                                                                            |
| `ScrollBar` slider   | track `#252527`, thumb `#9a9ea3`                                                                                                                                                                                           |

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

You can tell, but only upstream of the normalize call, by checking the raw result — which is
what `src/2-screen/3-refreshTheme.js` does:

```js
const detected = colors.defaultBackground === null ? null : tui.normalizeTerminalPalette(colors);
```

## Checked, and fine

- **Blank cells outside a partial-width renderable get `38;2;255;255;255`** rather than SGR 39.
  Inconsistent with the colour-intent system, but invisible — they are spaces on a default
  background — and a completely empty renderer emits no colour codes at all.
- **`@opentui/qrcode` defaults to black-on-white and ignores the terminal theme.** Correct as
  is: inverted QR codes fail on many phone scanners, so this one _should_ be theme-independent.
