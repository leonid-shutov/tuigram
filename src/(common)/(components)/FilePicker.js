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
 * @type {Required<FilePickerKeyBindings>}
 */
const DEFAULT_KEY_BINDINGS = {
  moveUp: [{ name: 'up' }, { name: 'k' }],
  moveDown: [{ name: 'down' }, { name: 'j' }],
  // `gg`/`shift+g` are the conventional first/last chords, but this handler only ever sees one
  // keypress at a time — tuigram drives `first()`/`last()` itself through a sequence-aware keymap
  // layer instead of a single-key default here.
  first: [{ name: 'home' }],
  last: [{ name: 'end' }],
  open: [{ name: 'return' }, { name: 'linefeed' }, { name: 'l' }, { name: 'right' }],
  goUp: [{ name: 'left' }, { name: 'h' }],
  startFilter: [{ name: '/' }],
  acceptFilter: [{ name: 'return' }],
  cancel: [{ name: 'escape' }],
};

// eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
const Events = /** @type {const} */ ({
  /** A file was chosen. Payload: its absolute path. The renderable does not hide itself. */
  SELECT: 'select',
  /** The user asked to leave without picking anything. */
  CANCEL: 'cancel',
  /** The browsed directory changed. Payload: the new absolute path. */
  DIRECTORY_CHANGED: 'directoryChanged',
  /** The highlighted row changed. Payload: (index, entry). */
  SELECTION_CHANGED: 'selectionChanged',
  /** Entered or left filter-editing mode. Payload: whether filtering is now active. */
  MODE_CHANGED: 'modeChanged',
  /** A `readdir`/`stat` failed. Payload: the raw error. The last-good listing is kept on screen. */
  ERROR: 'error',
});

/**
 * @param {import('@opentui/core').KeyEvent} key
 * @param {FilePickerKeyBinding[]} patterns
 */
const matchesAction = (key, patterns) =>
  patterns.some(
    (pattern) =>
      key.name === pattern.name &&
      Boolean(pattern.ctrl) === key.ctrl &&
      Boolean(pattern.shift) === key.shift &&
      Boolean(pattern.meta) === key.meta,
  );

/**
 * Reads one directory, synchronously: `..` first when `dir` is not the filesystem root, then
 * directories, then files, each group sorted by name. `filterPredicate` applies to files only —
 * directories always pass, so a filtered file type stays reachable by navigation.
 * @param {string} dir absolute path, already resolved
 * @param {FilePickerOptions['filter']} [filterPredicate]
 * @returns {FileEntry[]}
 */
const listDirectory = (dir, filterPredicate) => {
  /** @type {FileEntry[]} */
  const entries = [];
  for (const dirent of node.fs.readdirSync(dir, { withFileTypes: true })) {
    const isDirectory = dirent.isDirectory();
    if (!isDirectory && filterPredicate && !filterPredicate({ name: dirent.name, isDirectory })) continue;
    entries.push({ name: dirent.name, isDirectory });
  }
  entries.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  if (node.path.parse(dir).root !== dir) entries.unshift({ name: '..', isDirectory: true });
  return entries;
};

// Browses the local filesystem and lets the user pick one file. A leaf, buffered Renderable —
// bordering/framing is the host's job, the same split SelectRenderable leaves to its caller.
// Directory reads are synchronous: a constructor can't be async, and keeping every navigation one
// atomic state transition avoids races from rapid key-repeat outracing an in-flight read. This
// visibly hitches on very large or slow (e.g. network-mounted) directories.
Object.assign(
  Component(
    class FilePickerRenderable extends tui.Renderable {
      /**
       * @param {import('@opentui/core').RenderContext} ctx
       * @param {FilePickerOptions} [options]
       */
      constructor(ctx, options = {}) {
        super(ctx, { ...options, buffered: true });
        this.focusable = true;

        // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
        this._colors = /** @type {Record<keyof typeof DEFAULT_COLORS, import('@opentui/core').RGBA>} */ ({});
        // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
        const colorKeys = /** @type {(keyof typeof DEFAULT_COLORS)[]} */ (Object.keys(DEFAULT_COLORS));
        for (const key of colorKeys) this._colors[key] = tui.parseColor(options[key] ?? DEFAULT_COLORS[key]);

        this._filterPredicate = typeof options.filter === 'function' ? options.filter : undefined;
        this._keyBindings = { ...DEFAULT_KEY_BINDINGS, ...options.keyBindings };

        this._headerHeight = 1;
        this.maxVisibleItems = 1;
        this.scrollOffset = 0;

        this._cwd = node.path.resolve(options.startDirectory ?? process.cwd());
        /** @type {FileEntry[]} */
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
        return this._visibleEntries()[this._selectedIndex] ?? null;
      }

      /** Whether the live filter is being edited right now, as opposed to merely applied. */
      get filtering() {
        return this._filtering;
      }

      get filter() {
        return this._filter;
      }

      /** @returns {FileEntry[]} */
      _visibleEntries() {
        if (this._filter === '') return this._entries;
        const query = this._filter.toLowerCase();
        return this._entries.filter((entry) => entry.name === '..' || entry.name.toLowerCase().includes(query));
      }

      /**
       * Attempts to load `dir`. Only commits `_cwd`/`_entries` on success — a failing
       * `readdir`/`stat` leaves the last-good listing on screen instead of blanking it.
       * @param {string} dir
       * @param {{ emitChange?: boolean }} [options]
       */
      _load(dir, options = {}) {
        try {
          const entries = listDirectory(dir, this._filterPredicate);
          this._cwd = dir;
          this._entries = entries;
          this._selectedIndex = 0;
          this._filter = '';
          this._setFiltering(false);
          this._lastError = null;
          this._updateScrollOffset();
          this.requestRender();
          if (options.emitChange !== false) this.emit(Events.DIRECTORY_CHANGED, this._cwd);
          return true;
        } catch (error) {
          this._lastError = error;
          this.requestRender();
          this.emit(Events.ERROR, error);
          return false;
        }
      }

      /** Re-reads the current directory, e.g. after the host knows the filesystem changed. */
      refresh() {
        this._load(this._cwd);
      }

      /** @param {number} [steps] */
      moveUp(steps = 1) {
        if (this._visibleEntries().length === 0) return;
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
        this.emit(Events.SELECTION_CHANGED, this._selectedIndex, this.selectedEntry);
      }

      /** Jumps to the first entry. */
      first() {
        if (this._visibleEntries().length === 0) return;
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
          const target = entry.name === '..' ? node.path.dirname(this._cwd) : node.path.join(this._cwd, entry.name);
          this._load(target);
        } else {
          this.emit(Events.SELECT, node.path.join(this._cwd, entry.name));
        }
      }

      /** Goes up one directory. A no-op at the filesystem root. */
      goUp() {
        const target = node.path.dirname(this._cwd);
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
        this.emit(Events.CANCEL);
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
        this.emit(Events.MODE_CHANGED, filtering);
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
        this.maxVisibleItems = Math.max(1, this.height - this._headerHeight);
      }

      _updateScrollOffset() {
        const count = this._visibleEntries().length;
        const maxOffset = Math.max(0, count - this.maxVisibleItems);
        const centred = this._selectedIndex - Math.floor(this.maxVisibleItems / 2);
        const newOffset = Math.max(0, Math.min(centred, maxOffset));
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
        const bindings = this._keyBindings;
        if (matchesAction(key, bindings.moveUp)) this.moveUp();
        else if (matchesAction(key, bindings.moveDown)) this.moveDown();
        else if (matchesAction(key, bindings.first)) this.first();
        else if (matchesAction(key, bindings.last)) this.last();
        else if (matchesAction(key, bindings.open)) this.open();
        else if (matchesAction(key, bindings.goUp)) this.goUp();
        else if (matchesAction(key, bindings.startFilter)) this.startFilter();
        else if (key.name === 'backspace') this.backspace();
        else if (matchesAction(key, bindings.cancel)) this.cancel();
        else return false;
        return true;
      }

      /**
       * Deliberately hardcoded to the bare arrows, not `moveUp`/`moveDown` bindings — those include
       * `j`/`k` for browse mode, and while filtering `j`/`k` must type into the filter.
       * @param {import('@opentui/core').KeyEvent} key
       */
      _handleFilterKeyPress(key) {
        if (key.name === 'up') this.moveUp();
        else if (key.name === 'down') this.moveDown();
        else if (matchesAction(key, this._keyBindings.acceptFilter)) this.acceptFilter();
        else if (key.name === 'backspace') this.backspace();
        else if (matchesAction(key, this._keyBindings.cancel)) this.cancel();
        else if (key.name.length === 1 && !key.ctrl && !key.meta) this._typeCharacter(key.name);
        else return false;
        return true;
      }

      renderSelf() {
        if (!this.visible || !this.frameBuffer) return;
        if (this.isDirty) this._repaint();
      }

      _repaint() {
        if (!this.frameBuffer) return;
        const bg = this.focused ? this._colors.focusedBackgroundColor : this._colors.backgroundColor;
        this.frameBuffer.clear(bg);

        const headerText = this._filtering
          ? `${this._cwd}  /${this._filter}▏`
          : this._filter === ''
            ? this._cwd
            : `${this._cwd}  (filter: ${this._filter})`;
        const headerColor = this._filtering ? this._colors.selectedTextColor : this._colors.descriptionColor;
        this.frameBuffer.drawText(headerText, 0, 0, headerColor, undefined, tui.TextAttributes.DIM);

        const visible = this._visibleEntries();
        const slice = visible.slice(this.scrollOffset, this.scrollOffset + this.maxVisibleItems);

        for (const [i, entry] of slice.entries()) {
          const isSelected = this.scrollOffset + i === this._selectedIndex;
          const y = this._headerHeight + i;
          if (y >= this.height) break;

          const rowBg = isSelected ? this._colors.selectedBackgroundColor : bg;
          if (isSelected) this.frameBuffer.fillRect(0, y, this.width, 1, rowBg);

          const label = entry.isDirectory ? `${entry.name}/` : entry.name;
          const entryColor = entry.isDirectory ? this._colors.directoryColor : this._colors.fileColor;
          this.frameBuffer.drawText(label, 0, y, isSelected ? this._colors.selectedTextColor : entryColor, rowBg);
        }

        if (this._lastError !== null) {
          // Duck-typed: fs errors come from the Node realm, so `instanceof Error` fails in the sandbox.
          // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
          const error = /** @type {any} */ (this._lastError);
          const message = typeof error?.message === 'string' ? error.message : String(error);
          const y = Math.max(this._headerHeight, this.height - 1);
          this.frameBuffer.drawText(message, 0, y, this._colors.errorColor);
        }
      }
    },
  ),
  { Events },
);
