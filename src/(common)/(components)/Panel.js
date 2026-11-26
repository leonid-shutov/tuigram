const SEPARATOR = ' · ';
// A corner and the border cell beside it, at each end of an edge.
const INSET = 2;
// The spaces either side of a title.
const PADDING = 2;
// Border cells kept between a left and a right title.
const TITLE_GAP = 1;
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const SPINNER_INTERVAL_MS = 120;

// A box whose edge titles are built from named parts. Each edge has a left and a right group, each
// listing its parts in order; they are joined, and the last gives way first when the edge runs out
// of room. A lone group is the edge's title, in the box's colour and focus, where opentui puts a
// title. With both groups showing, the left one is the title and the right one gives way, whole,
// before the left one does. A centre group goes on the edge's middle cell, whole or not at all: it
// never pushes the side titles aside, it just skips the frame when it would touch one. All of it is
// drawn here, composed against the width of the frame being painted: since opentui 0.6 a box's own
// title is native state that a setter stages for a later frame, so it can't follow this frame's
// width. An edge with parts should get no `title` / `bottomTitle` of its own; it would show under
// these. A flash shows over a part for a while, and a spinner until it's stopped; writes to the
// part meanwhile land underneath them, and are what shows once they're over.
Component(
  class PanelRenderable extends tui.BoxRenderable {
    /**
     * @param {import('@opentui/core').RenderContext} ctx
     * @param {PanelOptions} options
     */
    constructor(ctx, { titleParts = {}, onTitlePartClick, ...options }) {
      super(ctx, options);
      this.titleParts = titleParts;
      /** @type {((name: string) => void) | undefined} */
      this.onTitlePartClick = onTitlePartClick;
      // Parts of the edge titles as last drawn, in panel coordinates: a click on one reaches the
      // handler below by walking these, since opentui's hit test only knows the panel as a whole.
      /** @type {{ name: string, x: number, y: number, width: number }[]} */
      this.hitRegions = [];
      this.onMouseDown = this.clickTitlePart;
      /** @type {Map<string, string>} */
      this.partTexts = new Map(
        Object.values(titleParts).flatMap((edge) =>
          Object.values(edge).flatMap((names) => names.map((name) => [name, ''])),
        ),
      );
      /** @type {Map<string, { text: string, timer: NodeJS.Timeout }>} */
      this.flashes = new Map();
      /** @type {Map<string, { frame: number, timer?: NodeJS.Timeout }>} */
      this.spinners = new Map();
    }

    /** @param {import('@opentui/core').MouseEvent} event */
    clickTitlePart(event) {
      const click = this.onTitlePartClick;
      if (click === undefined || event.button !== 0) return;
      const x = event.x - this.screenX;
      const y = event.y - this.screenY;
      const hit = this.hitRegions.find((part) => part.y === y && x >= part.x && x < part.x + part.width);
      if (hit === undefined) return;
      // Keep opentui from focusing the panel on the way out: the click is the action.
      event.preventDefault();
      event.stopPropagation();
      click(hit.name);
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
     * Shows nothing for the first `delay` ms, so a quick stop never flickers. A later spinner on the
     * same part replaces this one, and this one's stop then does nothing.
     * @param {string} name
     * @param {number} [delay]
     * @returns {{ stop(): void }} Its `stop` is a no-op once called.
     */
    spinTitlePart(name, delay = 0) {
      if (!this.partTexts.has(name)) throw new Error(`Panel has no title part "${name}"`);
      node.timers.clearTimeout(this.spinners.get(name)?.timer);
      /** @type {{ frame: number, timer?: NodeJS.Timeout }} */
      const spinner = { frame: -1 };
      const tick = () => {
        spinner.frame = (spinner.frame + 1) % SPINNER_FRAMES.length;
        this.requestRender();
      };
      spinner.timer = node.timers
        .setTimeout(() => {
          tick();
          spinner.timer = node.timers.setInterval(tick, SPINNER_INTERVAL_MS).unref();
        }, delay)
        .unref();
      this.spinners.set(name, spinner);
      return {
        stop: () => {
          if (this.spinners.get(name) !== spinner) return;
          // A Timeout from either setter clears with either clearer.
          node.timers.clearTimeout(spinner.timer);
          this.spinners.delete(name);
          this.requestRender();
        },
      };
    }

    /**
     * The flash or spinner frame shown over a part, else its own text.
     * @param {string} name
     */
    partText(name) {
      const flash = this.flashes.get(name);
      if (flash) return flash.text;
      const frame = this.spinners.get(name)?.frame ?? -1;
      if (frame >= 0) return SPINNER_FRAMES[frame];
      return this.partTexts.get(name) ?? '';
    }

    /**
     * @param {string[]} names
     * @param {number} [room] Cells for the parts, padding excluded.
     * @param {boolean} [whole] Drop a part that doesn't fit instead of clipping it.
     * @returns {{ text: string, parts: { name: string, x: number, width: number }[] } | null}
     */
    composeTitle(names, room = this.width - INSET * 2 - PADDING, whole = false) {
      /** @type {string[]} */
      const shown = [];
      /** @type {{ name: string, text: string }[]} */
      const kept = [];
      for (const name of names) {
        const text = this.partText(name);
        if (text === '') continue;
        const gap = shown.length === 0 ? 0 : SEPARATOR.length;
        const clipped = Cells.clip(text, room - gap).trimEnd();
        if (clipped === '' || (whole && clipped !== text)) break;
        shown.push(clipped);
        kept.push({ name, text: clipped });
        room -= gap + Cells.width(clipped);
      }
      if (shown.length === 0) return null;

      /** @type {{ name: string, x: number, width: number }[]} */
      const parts = [];
      let x = 1; // The leading space the title opens with.
      for (const [index, part] of kept.entries()) {
        if (index > 0) x += SEPARATOR.length;
        const width = Cells.width(part.text);
        parts.push({ name: part.name, x, width });
        x += width;
      }
      return { text: ` ${shown.join(SEPARATOR)} `, parts };
    }

    // Composed against the width of this very frame, and drawn over the border opentui paints.
    /** @param {import('@opentui/core').OptimizedBuffer} buffer */
    renderSelf(buffer) {
      super.renderSelf(buffer);
      this.hitRegions = [];
      const top = this.titleParts.top && this.composeEdge(this.titleParts.top);
      const bottom = this.titleParts.bottom && this.composeEdge(this.titleParts.bottom);
      if (top) this.drawEdge(buffer, top, this.screenY);
      if (bottom) this.drawEdge(buffer, bottom, this.screenY + this.height - 1);
    }

    /**
     * @param {import('@opentui/core').OptimizedBuffer} buffer
     * @param {ComposedEdge} edge
     * @param {number} y
     */
    drawEdge(buffer, edge, y) {
      if (edge.title !== undefined) {
        const x = edge.alignment === 'left' ? INSET : this.width - INSET - Cells.width(edge.title);
        for (const part of edge.parts) {
          this.hitRegions.push({ name: part.name, x: x + part.x, y: y - this.screenY, width: part.width });
        }
        if (edge.alignment === 'left') this.drawTitle(buffer, edge.title, INSET, y);
        else this.drawRight(buffer, edge.title, y);
      }
      if (edge.right) this.drawRight(buffer, edge.right, y);
      this.drawCenter(buffer, edge, y);
    }

    destroySelf() {
      for (const { timer } of this.flashes.values()) node.timers.clearTimeout(timer);
      this.flashes.clear();
      for (const { timer } of this.spinners.values()) node.timers.clearTimeout(timer);
      this.spinners.clear();
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
      if (title === null) {
        const rightEdge = this.composeTitle(right);
        return {
          title: rightEdge?.text,
          alignment: 'right',
          center: middle?.text,
          parts: rightEdge?.parts ?? [],
        };
      }
      const room = this.width - INSET * 2 - PADDING - Cells.width(title.text) - TITLE_GAP;
      const rightEdge = this.composeTitle(right, room, true);
      return {
        title: title.text,
        alignment: 'left',
        right: rightEdge?.text,
        center: middle?.text,
        parts: title.parts,
      };
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
      const focused = this._focusable && (this._focused || this.hasFocusedDescendant);
      const fg = this._titleColor ?? (focused ? this._focusedBorderColor : this._borderColor);
      // On a transparent background a space would leave the border under it showing.
      buffer.drawText(title, this.screenX + x, y, fg, tui.parseColor(config.theme.bg));
    }
  },
);
