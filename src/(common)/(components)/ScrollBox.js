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
});
