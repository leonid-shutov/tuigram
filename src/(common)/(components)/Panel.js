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
// is drawn here in the same colour; it gives way, whole, before the left one does. A centre group
// is drawn here too, on the edge's middle cell, whole or not at all: it never pushes the side
// titles aside, it just skips the frame when it would touch one. An edge with
// parts owns its title: a direct `title` / `bottomTitle` write or alignment is overwritten next
// frame. A flash shows over a part for a while; writes to the part meanwhile land underneath it,
// and are what shows once it's over.
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
      /** @type {Map<string, { text: string, timer: NodeJS.Timeout }>} */
      this.flashes = new Map();
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

    /**
     * A later flash of the same part replaces this one, timer included.
     * @param {string} name
     * @param {string} text
     * @param {number} ms
     */
    flashTitlePart(name, text, ms) {
      if (!this.partTexts.has(name)) throw new Error(`Panel has no title part "${name}"`);
      node.timers.clearTimeout(this.flashes.get(name)?.timer);
      const timer = node.timers.setTimeout(() => {
        this.flashes.delete(name);
        this.requestRender();
      }, ms);
      timer.unref();
      this.flashes.set(name, { text, timer });
      this.requestRender();
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
        const text = this.flashes.get(name)?.text ?? this.partTexts.get(name) ?? '';
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
      const bottomY = this._screenY + this.height - 1;
      if (top?.right) this.drawRight(buffer, top.right, this._screenY);
      if (bottom?.right) this.drawRight(buffer, bottom.right, bottomY);
      if (top) this.drawCenter(buffer, top, this._screenY);
      if (bottom) this.drawCenter(buffer, bottom, bottomY);
    }

    destroySelf() {
      for (const { timer } of this.flashes.values()) node.timers.clearTimeout(timer);
      this.flashes.clear();
      super.destroySelf();
    }

    /**
     * The edge's opentui title, its right group when both side groups show, and its centre group.
     * @param {PanelEdge} edge
     * @returns {ComposedEdge}
     */
    composeEdge({ left = [], right = [], center = [] }) {
      const middle = this.composeTitle(center, undefined, true);
      const title = this.composeTitle(left);
      if (title === undefined) {
        return { title: this.composeTitle(right), alignment: 'right', center: middle };
      }
      const room = this.width - INSET * 2 - PADDING - Cells.width(title) - TITLE_GAP;
      return { title, alignment: 'left', right: this.composeTitle(right, room, true), center: middle };
    }

    /**
     * @param {import('@opentui/core').OptimizedBuffer} buffer
     * @param {string} title
     * @param {number} y
     */
    drawRight(buffer, title, y) {
      this.drawTitle(buffer, title, this.width - INSET - Cells.width(title), y);
    }

    /**
     * Centred on the edge, or skipped when it would come within TITLE_GAP of a side title.
     * @param {import('@opentui/core').OptimizedBuffer} buffer
     * @param {ComposedEdge} edge
     * @param {number} y
     */
    drawCenter(buffer, { title, alignment, right, center }, y) {
      if (center === undefined) return;
      const width = Cells.width(center);
      const x = Math.floor((this.width - width) / 2);
      const leftTitle = alignment === 'left' ? title : undefined;
      const rightTitle = alignment === 'right' ? title : right;
      const from = leftTitle ? INSET + Cells.width(leftTitle) + TITLE_GAP : INSET;
      const to = rightTitle ? this.width - INSET - Cells.width(rightTitle) - TITLE_GAP : this.width - INSET;
      if (x >= from && x + width <= to) this.drawTitle(buffer, center, x, y);
    }

    /**
     * @param {import('@opentui/core').OptimizedBuffer} buffer
     * @param {string} title
     * @param {number} x Relative to the panel.
     * @param {number} y
     */
    drawTitle(buffer, title, x, y) {
      const focused = this._focusable && (this._focused || this._hasFocusedDescendant);
      const fg = this._titleColor ?? (focused ? this._focusedBorderColor : this._borderColor);
      // On a transparent background a space would leave the border under it showing.
      buffer.drawText(title, this._screenX + x, y, fg, tui.parseColor(config.theme.bg));
    }
  },
);
