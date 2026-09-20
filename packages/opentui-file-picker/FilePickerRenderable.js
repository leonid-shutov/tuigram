import { Renderable, parseColor, TextAttributes } from '@opentui/core';
import * as path from 'node:path';
import { FilePickerRenderableEvents } from './FilePickerRenderableEvents.js';
import { listDirectory } from './internal/listDirectory.js';
import { formatEntry } from './internal/formatEntry.js';

const DEFAULT_COLORS = {
  backgroundColor: '#1e1e1e',
  focusedBackgroundColor: '#1e1e1e',
  textColor: '#d4d4d4',
  focusedTextColor: '#ffffff',
  selectedBackgroundColor: '#3a3d41',
  selectedTextColor: '#ffffff',
  directoryColor: '#4fc1ff',
  fileColor: '#d4d4d4',
  descriptionColor: '#808080',
  errorColor: '#f14c4c',
};

/**
 * Netrw-style: `j`/`k` and the arrows navigate in browse mode straight away, and `/` opens the
 * live filter. While filtering, only `Up`/`Down`/`Return`/`Backspace`/`Escape` are claimed — every
 * other single character types into the filter — so `j`/`k`/`h`/`l`/`g`/`/` stay free to type.
 * @type {Record<string, { name: string; ctrl?: boolean; shift?: boolean; meta?: boolean }[]>}
 */
const DEFAULT_KEY_BINDINGS = {
  moveUp: [{ name: 'up' }, { name: 'k' }],
  moveDown: [{ name: 'down' }, { name: 'j' }],
  // `gg`/`shift+g` are the conventional first/last chords, but this handler only ever sees one
  // keypress at a time — a host that wants the vim chord (tuigram does) drives `first()`/`last()`
  // itself through a sequence-aware keymap layer instead of a single-key default here.
  first: [{ name: 'home' }],
  last: [{ name: 'end' }],
  open: [{ name: 'return' }, { name: 'linefeed' }, { name: 'l' }, { name: 'right' }],
  goUp: [{ name: 'left' }, { name: 'h' }],
  startFilter: [{ name: '/' }],
  acceptFilter: [{ name: 'return' }],
  cancel: [{ name: 'escape' }],
};

/**
 * @param {import('@opentui/core').KeyEvent} key
 * @param {{ name: string; ctrl?: boolean; shift?: boolean; meta?: boolean }} pattern
 */
function matchesPattern(key, pattern) {
  if (key.name !== pattern.name) return false;
  if (Boolean(pattern.ctrl) !== key.ctrl) return false;
  if (Boolean(pattern.shift) !== key.shift) return false;
  if (Boolean(pattern.meta) !== key.meta) return false;
  return true;
}

/**
 * @param {import('@opentui/core').KeyEvent} key
 * @param {{ name: string; ctrl?: boolean; shift?: boolean; meta?: boolean }[]} patterns
 */
function matchesAction(key, patterns) {
  return patterns.some((pattern) => matchesPattern(key, pattern));
}

/**
 * @typedef {object} FilePickerRenderableOptions
 * @property {string} [startDirectory] Defaults to `process.cwd()`.
 * @property {(entry: { name: string; isDirectory: boolean }) => boolean} [filter] Applied to
 *   files only — directories always stay navigable so a filtered file type stays reachable.
 * @property {import('@opentui/core').ColorInput} [backgroundColor]
 * @property {import('@opentui/core').ColorInput} [focusedBackgroundColor]
 * @property {import('@opentui/core').ColorInput} [textColor]
 * @property {import('@opentui/core').ColorInput} [focusedTextColor]
 * @property {import('@opentui/core').ColorInput} [selectedBackgroundColor]
 * @property {import('@opentui/core').ColorInput} [selectedTextColor]
 * @property {import('@opentui/core').ColorInput} [directoryColor]
 * @property {import('@opentui/core').ColorInput} [fileColor]
 * @property {import('@opentui/core').ColorInput} [descriptionColor]
 * @property {import('@opentui/core').ColorInput} [errorColor]
 * @property {Partial<typeof DEFAULT_KEY_BINDINGS>} [keyBindings]
 */

/**
 * Browses the local filesystem and lets the user pick one file. A leaf, buffered `Renderable` —
 * bordering/framing is the host's job, the same split `SelectRenderable` leaves to its caller.
 *
 * No dependencies beyond `@opentui/core` (peer) and Node builtins. Directory reads are
 * synchronous: a constructor can't be async, and keeping every navigation one atomic state
 * transition avoids races from rapid key-repeat outracing an in-flight read. This will visibly
 * hitch on very large or slow (e.g. network-mounted) directories — acceptable for v1.
 */
export class FilePickerRenderable extends Renderable {
  /**
   * @param {import('@opentui/core').RenderContext} ctx
   * @param {FilePickerRenderableOptions} [options]
   */
  constructor(ctx, options = {}) {
    super(ctx, { ...options, buffered: true });
    this.focusable = true;

    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    this._colors = /** @type {Record<keyof typeof DEFAULT_COLORS, import('@opentui/core').RGBA>} */ ({});
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    const colorKeys = /** @type {(keyof typeof DEFAULT_COLORS)[]} */ (Object.keys(DEFAULT_COLORS));
    for (const key of colorKeys) {
      this._colors[key] = parseColor(options[key] ?? DEFAULT_COLORS[key]);
    }

    this._filterPredicate = typeof options.filter === 'function' ? options.filter : null;
    const keyBindingOverrides = options.keyBindings ?? {};
    this._keyBindings = {
      moveUp: keyBindingOverrides.moveUp ?? DEFAULT_KEY_BINDINGS.moveUp,
      moveDown: keyBindingOverrides.moveDown ?? DEFAULT_KEY_BINDINGS.moveDown,
      first: keyBindingOverrides.first ?? DEFAULT_KEY_BINDINGS.first,
      last: keyBindingOverrides.last ?? DEFAULT_KEY_BINDINGS.last,
      open: keyBindingOverrides.open ?? DEFAULT_KEY_BINDINGS.open,
      goUp: keyBindingOverrides.goUp ?? DEFAULT_KEY_BINDINGS.goUp,
      startFilter: keyBindingOverrides.startFilter ?? DEFAULT_KEY_BINDINGS.startFilter,
      acceptFilter: keyBindingOverrides.acceptFilter ?? DEFAULT_KEY_BINDINGS.acceptFilter,
      cancel: keyBindingOverrides.cancel ?? DEFAULT_KEY_BINDINGS.cancel,
    };

    this._headerHeight = 1;
    this.maxVisibleItems = 1;
    this.scrollOffset = 0;

    this._cwd = path.resolve(options.startDirectory ?? process.cwd());
    /** @type {import('./internal/listDirectory.js').FileEntry[]} */
    this._entries = [];
    this._selectedIndex = 0;
    this._filter = '';
    this._filtering = false;
    /** @type {unknown} */
    this._lastError = null;

    this._load(this._cwd, { emitChange: false });
    this._updateMaxVisibleItems();
    this._updateScrollOffset();
  }

  get cwd() {
    return this._cwd;
  }

  get selectedEntry() {
    const visible = this._visibleEntries();
    return visible[this._selectedIndex] ?? null;
  }

  /** Whether the live filter is being edited right now, as opposed to merely applied. */
  get filtering() {
    return this._filtering;
  }

  get filter() {
    return this._filter;
  }

  /** @returns {import('./internal/listDirectory.js').FileEntry[]} */
  _visibleEntries() {
    if (this._filter === '') return this._entries;
    const query = this._filter.toLowerCase();
    return this._entries.filter((entry) => entry.name === '..' || entry.name.toLowerCase().includes(query));
  }

  /**
   * Attempts to load `dir`. Only commits `_cwd`/`_entries` on success — a failing `readdir`/`stat`
   * leaves the last-good listing on screen instead of blanking it.
   * @param {string} dir
   * @param {{ emitChange?: boolean }} [options]
   */
  _load(dir, options = {}) {
    try {
      const entries = listDirectory(dir, this._filterPredicate ?? undefined);
      this._cwd = dir;
      this._entries = entries;
      this._selectedIndex = 0;
      this._filter = '';
      this._setFiltering(false);
      this._lastError = null;
      this._updateScrollOffset();
      this.requestRender();
      if (options.emitChange !== false) this.emit(FilePickerRenderableEvents.DIRECTORY_CHANGED, this._cwd);
      return true;
    } catch (error) {
      this._lastError = error;
      this.requestRender();
      this.emit(FilePickerRenderableEvents.ERROR, error);
      return false;
    }
  }

  /** Re-reads the current directory, e.g. after the host knows the filesystem changed. */
  refresh() {
    this._load(this._cwd);
  }

  /** @param {number} [steps] */
  moveUp(steps = 1) {
    const count = this._visibleEntries().length;
    if (count === 0) return;
    this._selectedIndex = Math.max(0, this._selectedIndex - steps);
    this._afterSelectionChange();
  }

  /** @param {number} [steps] */
  moveDown(steps = 1) {
    const count = this._visibleEntries().length;
    if (count === 0) return;
    this._selectedIndex = Math.min(count - 1, this._selectedIndex + steps);
    this._afterSelectionChange();
  }

  _afterSelectionChange() {
    this._updateScrollOffset();
    this.requestRender();
    this.emit(FilePickerRenderableEvents.SELECTION_CHANGED, this._selectedIndex, this.selectedEntry);
  }

  /** Jumps to the first entry. */
  first() {
    const count = this._visibleEntries().length;
    if (count === 0) return;
    this._selectedIndex = 0;
    this._afterSelectionChange();
  }

  /** Jumps to the last entry. */
  last() {
    const count = this._visibleEntries().length;
    if (count === 0) return;
    this._selectedIndex = count - 1;
    this._afterSelectionChange();
  }

  /** Opens the highlighted directory, or reports the highlighted file as selected. */
  open() {
    const entry = this.selectedEntry;
    if (entry === null) return;
    if (entry.isDirectory) {
      const target = entry.name === '..' ? path.dirname(this._cwd) : path.join(this._cwd, entry.name);
      this._load(target);
    } else {
      this.emit(FilePickerRenderableEvents.SELECT, path.join(this._cwd, entry.name));
    }
  }

  /** Goes up one directory. A no-op at the filesystem root. */
  goUp() {
    const target = path.dirname(this._cwd);
    if (target === this._cwd) return;
    this._load(target);
  }

  /**
   * While filtering: erases the last filter character, or — once empty — leaves filter mode.
   * Otherwise: clears an applied filter, or — with none applied — goes up a directory.
   */
  backspace() {
    if (this._filtering) {
      if (this._filter.length > 0) {
        this._filter = this._filter.slice(0, -1);
        this._selectedIndex = this._defaultFilterIndex();
        this._updateScrollOffset();
        this.requestRender();
      } else {
        this.acceptFilter();
      }
    } else if (this._filter.length > 0) {
      this.clearFilter();
    } else {
      this.goUp();
    }
  }

  cancel() {
    this.emit(FilePickerRenderableEvents.CANCEL);
  }

  /** Enters filter mode, keeping any already-applied filter text so it can be refined. */
  startFilter() {
    this._setFiltering(true);
    this.requestRender();
  }

  /** Leaves filter mode, keeping the filter text applied so the narrowing stays. */
  acceptFilter() {
    this._setFiltering(false);
    this.requestRender();
  }

  /** Drops the filter entirely and leaves filter mode, back to the full listing. */
  clearFilter() {
    this._filter = '';
    this._setFiltering(false);
    this._selectedIndex = 0;
    this._updateScrollOffset();
    this.requestRender();
  }

  /** @param {boolean} filtering */
  _setFiltering(filtering) {
    if (this._filtering === filtering) return;
    this._filtering = filtering;
    this.emit(FilePickerRenderableEvents.MODE_CHANGED, filtering);
  }

  /** @param {string} char */
  _typeCharacter(char) {
    this._filter += char;
    this._selectedIndex = this._defaultFilterIndex();
    this._updateScrollOffset();
    this.requestRender();
  }

  /** Index to select by default: skips a leading `..` when a real match follows it. */
  _defaultFilterIndex() {
    const visible = this._visibleEntries();
    return visible.length > 1 && visible[0].name === '..' ? 1 : 0;
  }

  _updateMaxVisibleItems() {
    const contentHeight = Math.max(0, this.height - this._headerHeight);
    this.maxVisibleItems = Math.max(1, contentHeight);
  }

  _updateScrollOffset() {
    const count = this._visibleEntries().length;
    const maxOffset = Math.max(0, count - this.maxVisibleItems);
    const newOffset = Math.max(0, Math.min(this._selectedIndex - Math.floor(this.maxVisibleItems / 2), maxOffset));
    if (newOffset !== this.scrollOffset) {
      this.scrollOffset = newOffset;
      this.requestRender();
    }
  }

  onResize() {
    this._updateMaxVisibleItems();
    this._updateScrollOffset();
    this.requestRender();
  }

  /** @param {import('@opentui/core').KeyEvent} key */
  handleKeyPress(key) {
    return this._filtering ? this._handleFilterKeyPress(key) : this._handleBrowseKeyPress(key);
  }

  /** @param {import('@opentui/core').KeyEvent} key */
  _handleBrowseKeyPress(key) {
    if (matchesAction(key, this._keyBindings.moveUp)) {
      this.moveUp();
      return true;
    }
    if (matchesAction(key, this._keyBindings.moveDown)) {
      this.moveDown();
      return true;
    }
    if (matchesAction(key, this._keyBindings.first)) {
      this.first();
      return true;
    }
    if (matchesAction(key, this._keyBindings.last)) {
      this.last();
      return true;
    }
    if (matchesAction(key, this._keyBindings.open)) {
      this.open();
      return true;
    }
    if (matchesAction(key, this._keyBindings.goUp)) {
      this.goUp();
      return true;
    }
    if (matchesAction(key, this._keyBindings.startFilter)) {
      this.startFilter();
      return true;
    }
    if (key.name === 'backspace') {
      this.backspace();
      return true;
    }
    if (matchesAction(key, this._keyBindings.cancel)) {
      this.cancel();
      return true;
    }
    return false;
  }

  /**
   * Deliberately hardcoded to the bare arrows, not `this._keyBindings.moveUp`/`moveDown` — those
   * include `j`/`k` for browse mode, and while filtering `j`/`k` must type into the filter.
   * @param {import('@opentui/core').KeyEvent} key
   */
  _handleFilterKeyPress(key) {
    if (key.name === 'up') {
      this.moveUp();
      return true;
    }
    if (key.name === 'down') {
      this.moveDown();
      return true;
    }
    if (matchesAction(key, this._keyBindings.acceptFilter)) {
      this.acceptFilter();
      return true;
    }
    if (key.name === 'backspace') {
      this.backspace();
      return true;
    }
    if (matchesAction(key, this._keyBindings.cancel)) {
      this.cancel();
      return true;
    }
    if (key.name.length === 1 && !key.ctrl && !key.meta) {
      this._typeCharacter(key.name);
      return true;
    }
    return false;
  }

  renderSelf() {
    if (!this.visible || !this.frameBuffer) return;
    if (this.isDirty) this._repaint();
  }

  _repaint() {
    if (!this.frameBuffer) return;
    const focused = this.focused;
    const bg = focused ? this._colors.focusedBackgroundColor : this._colors.backgroundColor;
    this.frameBuffer.clear(bg);

    const headerText = this._filtering
      ? `${this._cwd}  /${this._filter}▏`
      : this._filter === ''
        ? this._cwd
        : `${this._cwd}  (filter: ${this._filter})`;
    const headerColor = this._filtering ? this._colors.selectedTextColor : this._colors.descriptionColor;
    this.frameBuffer.drawText(headerText, 0, 0, headerColor, undefined, TextAttributes.DIM);

    const visible = this._visibleEntries();
    const slice = visible.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleItems);

    for (let i = 0; i < slice.length; i += 1) {
      const entry = slice[i];
      const actualIndex = this.scrollOffset + i;
      const isSelected = actualIndex === this._selectedIndex;
      const y = this._headerHeight + i;
      if (y >= this.height) break;

      if (isSelected) {
        this.frameBuffer.fillRect(0, y, this.width, 1, this._colors.selectedBackgroundColor);
      }

      const label = formatEntry(entry);
      const entryColor = entry.isDirectory ? this._colors.directoryColor : this._colors.fileColor;
      const labelColor = isSelected ? this._colors.selectedTextColor : entryColor;
      this.frameBuffer.drawText(label, 0, y, labelColor, isSelected ? this._colors.selectedBackgroundColor : bg);
    }

    if (this._lastError !== null) {
      const message = this._lastError instanceof Error ? this._lastError.message : String(this._lastError);
      this.frameBuffer.drawText(message, 0, Math.max(this._headerHeight, this.height - 1), this._colors.errorColor);
    }
  }
}
