// A child's offset from the top of the content, which is the space `scrollTop` lives in: padding,
// `gap` and `translateY` need no arithmetic on top. Read it only where layout is current — inside
// `afterLayout` — since a child added this tick has no box until the next frame lays it out.
/**
 * @param {import('@opentui/core').ScrollBoxRenderable} component
 * @param {import('@opentui/core').Renderable} child
 */
const topOf = (component, child) => child.screenY - component.content.screenY;

Object.assign(Component(tui.ScrollBoxRenderable), {
  // Insert content ABOVE a ScrollBox's viewport without the view appearing to move. `scrollTop` is
  // absolute from the TOP of the content, so growing the content above the viewport would shift
  // the view; opentui's `anchor` holds `anchor` at its place on screen instead, and is released
  // once the frame that lays out the change has run. The anchor must be a node `mutate` keeps and
  // doesn't resize: a slot that loses a separator to the content above it would hold its own top
  // still while what's inside it, and everything below, moves up by the separator's height.
  /**
   * @param {import('@opentui/core').ScrollBoxRenderable} component
   * @param {import('@opentui/core').Renderable} anchor A descendant that `mutate` keeps, unresized.
   * @param {() => void} mutate
   */
  preserveScroll: (component, anchor, mutate) => {
    const release = component.anchor(anchor);
    mutate();
    component.afterLayout(release);
  },

  // Pin the view to the very bottom of the content, even right after an append: `scrollTo` applies
  // again after the next layout, so a just-added child is counted. Landing at the end also
  // re-engages `stickyScroll` after a manual scroll has latched it off.
  /** @param {import('@opentui/core').ScrollBoxRenderable} component */
  scrollToBottom: (component) => component.scrollTo(Infinity),

  // Bring a child fully into view. opentui's own `scrollChildIntoView` resolves to the NEAREST
  // edge, which has no answer for a child as tall as the viewport: the view freezes while the
  // cursor keeps moving. The rule here is three lines: a child that fills the viewport pins its
  // top — it owns the whole section and the rest is clipped — and anything smaller goes to
  // whichever edge it fell off. It runs after the next layout, so a child added this tick counts.
  /**
   * @param {import('@opentui/core').ScrollBoxRenderable} component
   * @param {import('@opentui/core').Renderable} child
   */
  reveal: (component, child) =>
    component.afterLayout(() => {
      if (child.isDestroyed) return;
      const top = topOf(component, child);
      const { height } = child;
      const viewport = component.viewport.height;
      if (height >= viewport || top < component.scrollTop) component.scrollTop = top;
      else if (top + height > component.scrollTop + viewport) component.scrollTop = top + height - viewport;
    }),
});
