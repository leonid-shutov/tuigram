# @leonid-shutov/opentui-file-picker

A filesystem file picker `Renderable` for [OpenTUI](https://github.com/sst/opentui). Browses
directories and lets the user pick one file, netrw-style: `j`/`k` and the arrows navigate
straight away, and `/` opens a live filter. Zero runtime dependencies beyond `@opentui/core`
(peer) and Node builtins.

## Usage

```js
import { CliRenderer } from '@opentui/core';
import { FilePickerRenderable, FilePickerRenderableEvents } from '@leonid-shutov/opentui-file-picker';

const picker = new FilePickerRenderable(renderer, {
  startDirectory: process.env.HOME,
  width: 60,
  height: 20,
});

picker.on(FilePickerRenderableEvents.SELECT, (filePath) => {
  console.log('picked', filePath);
});
picker.on(FilePickerRenderableEvents.CANCEL, () => {
  // hide the picker
});

renderer.root.add(picker);
picker.focus();
```

Or, in composition-tree / JSX-adjacent code, via the exported construct:

```js
import { FilePicker } from '@leonid-shutov/opentui-file-picker';

const node = FilePicker({ startDirectory: process.env.HOME });
```

## Keyboard

The picker has two modes: **browse** (the default) and **filter**, entered with `/`.

### Browse mode

| Keys                | Action                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `Up` / `Down` / `k` / `j` | Move the selection                                                                        |
| `Home` / `End`       | Jump to the first / last entry                                                               |
| `Return` / `l` / `Right` | Open the highlighted directory, or select the highlighted file                            |
| `Left` / `h`         | Go up one directory (`goUp()` — named to avoid the base `Renderable`'s own `parent` property) |
| `Backspace`          | Clear an applied filter, or — with none applied — go up a directory                           |
| `/`                  | Enter filter mode (keeps any existing filter text, so it can be refined)                      |
| `Escape`             | Cancel                                                                                        |

### Filter mode

| Keys                          | Action                                                             |
| ------------------------------ | ------------------------------------------------------------------ |
| `Up` / `Down`                  | Move the selection within the matches                               |
| `Return`                       | Confirm — leave filter mode, keeping the narrowed list              |
| `Backspace`                    | Erase the last filter character, or — once empty — leave filter mode |
| `Escape`                       | Cancel (closes the picker outright, from either mode)                |
| any other printable character  | Append to the live filter                                          |

`j`/`k`/`h`/`l`/`/` are not bound in filter mode, so they type into the filter like any other
character. `gg`/`shift+g`-style chords aren't handled here — this component only ever sees one
keypress at a time — but `first()`/`last()` are exposed for a host with a sequence-aware keymap to
drive directly; the plain-key defaults for those are `Home`/`End`. Override any of the above via
the `keyBindings` option.

## Options

See `index.d.ts` for the full `FilePickerRenderableOptions` type — directory to start in, an
optional file filter predicate (directories are always navigable regardless of the filter, so a
filtered file type stays reachable), whether to show a size/mtime detail line, and colors for
every visual state.

## Events (`FilePickerRenderableEvents`)

- `select` — a file was chosen; payload is its absolute path. The component does not hide itself.
- `cancel` — the user asked to leave without picking anything.
- `directoryChanged` — the browsed directory changed.
- `selectionChanged` — the highlighted row changed.
- `modeChanged` — entered or left filter-editing mode; payload is whether filtering is now active.
- `error` — a `readdir`/`stat` call failed; the last-good listing stays on screen.

## Notes

- Directory reads are synchronous (`fs.readdirSync`/`fs.statSync`). This keeps every navigation a
  single atomic state transition — no races from rapid key-repeat outracing an in-flight async
  read — at the cost of a visible hitch on very large or slow (e.g. network-mounted) directories.
- Single-file selection only; there is no multi-select mode.
