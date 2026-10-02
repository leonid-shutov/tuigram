// SelectRenderable draws a whole row's name in one colour — nothing in its public API colours
// part of a row differently, not even per-row, let alone per-character. `paintMarker` works
// around that by letting Select draw normally, then repainting each visible row's trailing
// `marker` substring over the top in whatever colour `colorFor` picks.
//
// That means reaching past the public API into undocumented internals (`_options`,
// `scrollOffset`, `maxVisibleItems`, `linesPerItem`, `refreshFrameBuffer`) — checked against
// opentui 0.5.11. This is the one spot to check if a future opentui upgrade makes markers draw
// in the wrong place, the wrong colour, or not at all; the check below turns a silent mismatch
// into a startup crash with a clear cause instead.
/** @typedef {import('@opentui/core').SelectOption & { marker: string }} MarkerOption */

Object.assign(Component(tui.SelectRenderable), {
  /**
   * @param {import('@opentui/core').SelectRenderable} component
   * @param {(option: MarkerOption) => import('@opentui/core').RGBA} colorFor
   */
  paintMarker: (component, colorFor) => {
    const REQUIRED = ['_options', 'scrollOffset', 'maxVisibleItems', 'linesPerItem', 'refreshFrameBuffer'];
    /** @type {any} */
    const select = component;
    const missing = REQUIRED.filter((key) => select[key] === undefined);
    if (missing.length > 0) {
      throw new Error(
        `Select.paintMarker: opentui's SelectRenderable is missing ${missing.join(', ')} — ` +
          'check this against the installed opentui version.',
      );
    }

    const refresh = select.refreshFrameBuffer.bind(select);
    select.refreshFrameBuffer = () => {
      refresh();
      if (!select.frameBuffer) return;
      const visible = select._options.slice(select.scrollOffset, select.scrollOffset + select.maxVisibleItems);
      for (const [index, option] of visible.entries()) {
        const y = index * select.linesPerItem;
        if (option.marker === '' || y + select.linesPerItem - 1 >= select.height) continue;
        // Select starts text at x = 1; the name is padded out to end one cell short of the right
        // edge. The marker is always the trailing part of `name`, so its column falls out of the
        // two widths.
        const x = 1 + Cells.width(option.name) - Cells.width(option.marker);
        select.frameBuffer.drawText(option.marker, x, y, colorFor(option));
      }
    };
  },
});
