// SelectRenderable draws a whole row's name in one colour — nothing in its public API colours
// part of a row differently, not even per-row, let alone per-character. `paintMarker` works
// around that with a `renderAfter` hook: Select draws normally, then the hook repaints each
// visible row's trailing `marker` substring over the top in whatever colour `colorFor` picks.
//
// The hook reads three private fields (`scrollOffset`, `maxVisibleItems`, `linesPerItem`) to know
// which rows are on screen — checked against opentui 0.9.2. This is the one spot to check if a
// future opentui upgrade makes markers draw in the wrong place, the wrong colour, or not at all;
// the check below turns a silent mismatch into a startup crash with a clear cause instead.
/** @typedef {import('@opentui/core').SelectOption & { marker: string }} MarkerOption */

Object.assign(Component(tui.SelectRenderable), {
  /**
   * @param {import('@opentui/core').SelectRenderable} component
   * @param {(option: MarkerOption) => import('@opentui/core').RGBA} colorFor
   */
  paintMarker: (component, colorFor) => {
    const REQUIRED = ['scrollOffset', 'maxVisibleItems', 'linesPerItem'];
    /** @type {any} */
    const select = component;
    const missing = REQUIRED.filter((key) => select[key] === undefined);
    if (missing.length > 0) {
      throw new Error(
        `Select.paintMarker: opentui's SelectRenderable is missing ${missing.join(', ')} — ` +
          'check this against the installed opentui version.',
      );
    }

    // An unbuffered hook draws in screen coordinates, which is where Select's own rows went.
    component.renderAfter = (buffer) => {
      const { scrollOffset, maxVisibleItems, linesPerItem } = select;
      /** @type {MarkerOption[]} */
      const visible = select.options.slice(scrollOffset, scrollOffset + maxVisibleItems);
      for (const [index, option] of visible.entries()) {
        const y = index * linesPerItem;
        if (option.marker === '' || y + linesPerItem - 1 >= component.height) continue;
        // Select starts text at x = 1, after the two-cell `▶ ` when it draws one; the name is padded
        // out to end one cell short of the right edge. The marker is always the trailing part of
        // `name`, so its column falls out of the two widths.
        const indicator = component.showSelectionIndicator ? 2 : 0;
        const x = 1 + indicator + Cells.width(option.name) - Cells.width(option.marker);
        buffer.drawText(option.marker, component.screenX + x, component.screenY + y, colorFor(option));
      }
    };
  },
});
