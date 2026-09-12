Object.assign(Component(tui.ScrollBoxRenderable), {
  // Insert content ABOVE a ScrollBox's viewport without the view appearing to move.
  // `scrollTop` is absolute from the TOP of the content, so growing the content above the
  // viewport shifts the view; we add the inserted height back. Layout is forced synchronously
  // (yoga only, no paint) because letting the next frame paint first IS the flicker, and
  // `scrollSize` is refreshed first — it is a cached mirror, and its stale pre-insert value
  // would clamp the target to the old bottom.
  /**
   * @param {import('@opentui/core').ScrollBoxRenderable} component
   * @param {() => void} mutate
   */
  preserveScroll: (component, mutate) => {
    const content = component.content.getLayoutNode();
    const heightBefore = content.getComputedLayout().height;
    const scrollTopBefore = component.scrollTop;

    mutate();

    /** @type {import('@opentui/core').Renderable} */
    let root = component;
    while (root.parent) root = root.parent;
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    /** @type {import('@opentui/core').RootRenderable} */ (root).calculateLayout();

    const heightAfter = content.getComputedLayout().height;
    component.verticalScrollBar.scrollSize = heightAfter;
    component.scrollTop = scrollTopBefore + heightAfter - heightBefore;
  },

  // Pin the view to the very bottom of the content, even right after an append. Same two
  // load-bearing steps as `preserveScroll`: layout is forced so the just-added child has a
  // height, and the cached `scrollSize` is refreshed before the write, or the scrollbar would
  // clamp the target to the pre-insert bottom and leave the new content off-screen.
  // The write also lands the view exactly at opentui's sticky position, which re-engages
  // `stickyScroll` after a manual scroll has latched it off.
  /** @param {import('@opentui/core').ScrollBoxRenderable} component */
  scrollToBottom: (component) => {
    /** @type {import('@opentui/core').Renderable} */
    let root = component;
    while (root.parent) root = root.parent;
    // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
    /** @type {import('@opentui/core').RootRenderable} */ (root).calculateLayout();

    component.verticalScrollBar.scrollSize = component.content.getLayoutNode().getComputedLayout().height;
    // `scrollTop` clamps to `scrollSize - viewportSize`, so the overshoot is the bottom.
    component.scrollTop = component.scrollHeight;
  },
});
