// A query line over the items that match it, best first. Knows nothing of what the items are or
// what picking one means: the host drives the cursor and reads `selected`.
Component(
  class SearchListRenderable extends tui.BoxRenderable {
    /** @type {SearchListItem[]} */
    items = [];

    /**
     * The query `list` was last ranked for; `null` forces the next `filter` to rank.
     * @type {string | null}
     */
    query = null;

    /**
     * @param {import('@opentui/core').RenderContext} ctx
     * @param {SearchListOptions} options
     */
    constructor(ctx, { theme, placeholder = '', ...options }) {
      super(ctx, { flexDirection: 'column', ...options });

      this.input = new tui.TextareaRenderable(ctx, {
        width: '100%',
        height: 1,
        placeholder,
        placeholderColor: theme.muted,
        backgroundColor: theme.surface,
        focusedBackgroundColor: theme.surface,
        textColor: theme.fg,
        focusedTextColor: theme.fg,
        cursorColor: theme.accent,
        cursorStyle: { blinking: true },
        // Still needed for edits that arrive without a key, such as a paste.
        onContentChange: () => this.filter(),
      });

      // opentui reports a content change from its native buffer a microtask after the key is
      // handled, by which time the frame that key scheduled can already have been painted: the list
      // drawn lagged one key behind, and clearing the field kept showing the last query's results
      // until the next key. Filtering in the key's own handler puts the new list into that frame.
      const handleKeyPress = this.input.handleKeyPress.bind(this.input);
      this.input.handleKeyPress = (/** @type {import('@opentui/core').KeyEvent} */ key) => {
        const handled = handleKeyPress(key);
        if (handled) this.filter();
        return handled;
      };

      this.list = new tui.SelectRenderable(ctx, {
        flexGrow: 1,
        options: [],
        backgroundColor: theme.bg,
        focusedBackgroundColor: theme.bg,
        textColor: theme.fg,
        focusedTextColor: theme.fg,
        descriptionColor: theme.muted,
        selectedBackgroundColor: theme.selection,
        selectedTextColor: theme.fg,
        selectedDescriptionColor: theme.muted,
        showSelectionIndicator: true,
      });

      this.add(this.input);
      this.add(this.list);
    }

    /** @param {string} text */
    set placeholder(text) {
      this.input.placeholder = text;
    }

    get selected() {
      return this.list.getSelectedOption()?.value ?? null;
    }

    /** @param {SearchListItem[]} items */
    setItems(items) {
      this.items = items;
      this.query = null;
      // A second line only when some item has one to show.
      this.list.showDescription = items.some((item) => item.description !== '');
      this.filter();
    }

    reset() {
      this.input.replaceText('');
      this.input.setCursor(0, 0);
      this.filter();
    }

    // Every key runs this twice — from its handler, then from the late content change — and the
    // second run must not move a cursor the user has stepped since.
    filter() {
      const query = this.input.plainText;
      if (query === this.query) return;
      this.query = query;
      this.list.options = Fuzzy.rank(query, this.items);
      if (this.list.options.length > 0) this.list.setSelectedIndex(0);
    }

    moveUp() {
      this.list.moveUp();
    }

    moveDown() {
      this.list.moveDown();
    }

    // As many items as the list shows at once: each takes a second line when it has a description.
    get pageSize() {
      return Math.max(1, Math.floor(this.list.height / (this.list.showDescription ? 2 : 1)));
    }

    pageUp() {
      this.list.moveUp(this.pageSize);
    }

    pageDown() {
      this.list.moveDown(this.pageSize);
    }

    first() {
      if (this.list.options.length > 0) this.list.setSelectedIndex(0);
    }

    last() {
      const count = this.list.options.length;
      if (count > 0) this.list.setSelectedIndex(count - 1);
    }

    focus() {
      this.input.focus();
    }

    blur() {
      this.input.blur();
    }
  },
);
