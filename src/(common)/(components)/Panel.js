const SEPARATOR = ' · ';
// A corner and the border cell beside it, at each end of an edge.
const INSET = 2;
// The spaces either side of a title.
const PADDING = 2;
// Border cells kept between a left and a right title.
const TITLE_GAP = 1;

// A box whose edge titles are built from named parts. Each edge has a left and a right group, each
// listing its parts in order; they are joined, and the last gives way first when the edge runs out
// of room. A lone group is the edge's title, drawn by opentui with the box's colour and focus. With
// both groups showing, the left one is the title and the right one, which opentui has no slot for,
// is drawn here in the same colour; it gives way, whole, before the left one does. An edge with
// parts owns its title: a direct `title` / `bottomTitle` write or alignment is overwritten next
// frame.
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
      this.partTexts = new Map(
        Object.values(titleParts).flatMap((edge) =>
          Object.values(edge).flatMap((names) => names.map((name) => [name, ''])),
        ),
      );
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

    /** @param {string} name */
    getTitlePart(name) {
      return this.partTexts.get(name) ?? '';
    }

    /**
     * @param {string[]} names
     * @param {number} [room] Cells for the parts, padding excluded.
     * @param {boolean} [whole] Drop a part that doesn't fit instead of clipping it.
     */
    composeTitle(names, room = this.width - INSET * 2 - PADDING, whole = false) {
      /** @type {string[]} */
      const shown = [];
      for (const name of names) {
        const text = this.partTexts.get(name) ?? '';
        if (text === '') continue;
        const gap = shown.length === 0 ? 0 : SEPARATOR.length;
        const clipped = Cells.clip(text, room - gap).trimEnd();
        if (clipped === '' || (whole && clipped !== text)) break;
        shown.push(clipped);
        room -= gap + Cells.width(clipped);
      }
      return shown.length === 0 ? undefined : ` ${shown.join(SEPARATOR)} `;
    }

    // Composed against the width of this very frame. The fields, not the setters: a setter
    // requests a render, and this already is one.
    /** @param {import('@opentui/core').OptimizedBuffer} buffer */
    renderSelf(buffer) {
      const top = this.titleParts.top && this.composeEdge(this.titleParts.top);
      const bottom = this.titleParts.bottom && this.composeEdge(this.titleParts.bottom);
      if (top) {
        this._title = top.title;
        this._titleAlignment = top.alignment;
      }
      if (bottom) {
        this._bottomTitle = bottom.title;
        this._bottomTitleAlignment = bottom.alignment;
      }
      super.renderSelf(buffer);
      if (top?.right) this.drawRight(buffer, top.right, this._screenY);
      if (bottom?.right) this.drawRight(buffer, bottom.right, this._screenY + this.height - 1);
    }

    /**
     * The edge's opentui title, and its right group when both groups show.
     * @param {PanelEdge} edge
     * @returns {{ title: string | undefined, alignment: 'left' | 'right', right?: string }}
     */
    composeEdge({ left = [], right = [] }) {
      const title = this.composeTitle(left);
      if (title === undefined) return { title: this.composeTitle(right), alignment: 'right' };
      const room = this.width - INSET * 2 - PADDING - Cells.width(title) - TITLE_GAP;
      return { title, alignment: 'left', right: this.composeTitle(right, room, true) };
    }

    /**
     * @param {import('@opentui/core').OptimizedBuffer} buffer
     * @param {string} title
     * @param {number} y
     */
    drawRight(buffer, title, y) {
      const focused = this._focusable && (this._focused || this._hasFocusedDescendant);
      const fg = this._titleColor ?? (focused ? this._focusedBorderColor : this._borderColor);
      // On a transparent background a space would leave the border under it showing.
      const x = this._screenX + this.width - INSET - Cells.width(title);
      buffer.drawText(title, x, y, fg, tui.parseColor(config.theme.bg));
    }
  },
);
