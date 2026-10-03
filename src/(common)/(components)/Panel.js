const SEPARATOR = ' · ';

// A box whose edge titles are built from named parts. Each edge lists its parts in order; they are
// joined, and the last gives way first when the edge runs out of room. opentui still draws the
// result as the edge's title, so alignment, colour and focus are the box's own options. An edge
// with parts owns its title: a direct `title` / `bottomTitle` write is overwritten next frame.
Component(
  class PanelRenderable extends tui.BoxRenderable {
    /**
     * @param {import('@opentui/core').RenderContext} ctx
     * @param {PanelOptions} options
     */
    constructor(ctx, { titleParts = {}, ...options }) {
      super(ctx, options);
      this.titleParts = titleParts;
      /** @type {Map<string, string>} */
      this.partTexts = new Map(Object.values(titleParts).flatMap((names) => names.map((name) => [name, ''])));
    }

    /**
     * @param {string} name
     * @param {string} text
     */
    setTitlePart(name, text) {
      if (!this.partTexts.has(name)) throw new Error(`Panel has no title part "${name}"`);
      if (this.partTexts.get(name) === text) return;
      this.partTexts.set(name, text);
      this.requestRender();
    }

    /** @param {string} name */
    clearTitlePart(name) {
      this.setTitlePart(name, '');
    }

    /** @param {string[]} names */
    composeTitle(names) {
      // Two corners, a cell of border beside each, and the title's own padding spaces.
      let room = this.width - 6;
      /** @type {string[]} */
      const shown = [];
      for (const name of names) {
        const text = this.partTexts.get(name) ?? '';
        if (text === '') continue;
        const gap = shown.length === 0 ? 0 : SEPARATOR.length;
        const clipped = Cells.clip(text, room - gap).trimEnd();
        if (clipped === '') break;
        shown.push(clipped);
        room -= gap + Cells.width(clipped);
      }
      return shown.length === 0 ? undefined : ` ${shown.join(SEPARATOR)} `;
    }

    // Composed against the width of this very frame. The fields, not the setters: a setter
    // requests a render, and this already is one.
    /** @param {import('@opentui/core').OptimizedBuffer} buffer */
    renderSelf(buffer) {
      if (this.titleParts.top) this._title = this.composeTitle(this.titleParts.top);
      if (this.titleParts.bottom) this._bottomTitle = this.composeTitle(this.titleParts.bottom);
      super.renderSelf(buffer);
    }
  },
);
