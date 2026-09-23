// Settle the tree before any `scrollTop` write: yoga lays out from the root (no paint) so a
// just-added child already has a box, and `verticalScrollBar.scrollSize` — a cached mirror that
// would otherwise clamp the target to the pre-mutation bottom — is refreshed from the result.
// Layout is forced synchronously because letting the next frame paint first IS the flicker.
/**
 * @param {import('@opentui/core').ScrollBoxRenderable} component
 * @returns {number} the content's settled height
 */
const settle = (component) => {
  /** @type {import('@opentui/core').Renderable} */
  let root = component;
  while (root.parent) root = root.parent;
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  /** @type {import('@opentui/core').RootRenderable} */ (root).calculateLayout();

  const height = component.content.getLayoutNode().getComputedLayout().height;
  component.verticalScrollBar.scrollSize = height;
  return height;
};

Object.assign(Component(tui.ScrollBoxRenderable), {
  // Insert content ABOVE a ScrollBox's viewport without the view appearing to move.
  // `scrollTop` is absolute from the TOP of the content, so growing the content above the
  // viewport shifts the view; we add the inserted height back.
  /**
   * @param {import('@opentui/core').ScrollBoxRenderable} component
   * @param {() => void} mutate
   */
  preserveScroll: (component, mutate) => {
    const heightBefore = component.content.getLayoutNode().getComputedLayout().height;
    const scrollTopBefore = component.scrollTop;

    mutate();

    const heightAfter = settle(component);
    component.scrollTop = scrollTopBefore + heightAfter - heightBefore;
  },

  // Pin the view to the very bottom of the content, even right after an append. The write also
  // lands the view exactly at opentui's sticky position, which re-engages `stickyScroll` after a
  // manual scroll has latched it off.
  /** @param {import('@opentui/core').ScrollBoxRenderable} component */
  scrollToBottom: (component) => {
    settle(component);
    // `scrollTop` clamps to `scrollSize - viewportSize`, so the overshoot is the bottom.
    component.scrollTop = component.scrollHeight;
  },

  // Bring a child fully into view. opentui's own `scrollChildIntoView` resolves to the NEAREST
  // edge, which has no answer for a child as tall as the viewport: its `getNearestDelta` returns 0
  // both when the child straddles both edges and when the two heights are exactly equal (strict
  // `<`/`>`), so the view freezes while the cursor keeps moving. The rule here is three lines: a
  // child that fills the viewport pins its top — it owns the whole section and the rest is clipped
  // — and anything smaller goes to whichever edge it fell off.
  /**
   * @param {import('@opentui/core').ScrollBoxRenderable} component
   * @param {import('@opentui/core').Renderable} child
   */
  reveal: (component, child) => {
    settle(component);
    // The mirrors `child.y`/`.height` are only written by the render pass, so a child added this
    // tick reads garbage from them. `getComputedLayout().top` is relative to the content box,
    // which is exactly the space `scrollTop` lives in — padding, `gap` and `translateY` need no
    // arithmetic on top.
    const { top, height } = child.getLayoutNode().getComputedLayout();
    const viewport = component.viewport.height;

    if (height >= viewport || top < component.scrollTop) component.scrollTop = top;
    else if (top + height > component.scrollTop + viewport) component.scrollTop = top + height - viewport;
  },
});
