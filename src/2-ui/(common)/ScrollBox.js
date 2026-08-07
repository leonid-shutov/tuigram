Object.assign(Component(tui.ScrollBoxRenderable), {
  // Run a mutation that inserts content ABOVE a ScrollBox's current viewport without the
  // content already on screen appearing to move — and without a one-frame flicker.
  //
  // A ScrollBox stores its position as `scrollTop`, an absolute offset from the TOP of the
  // content. Inserting content above the viewport pushes everything down by the inserted
  // height while `scrollTop` keeps its old value, so the view would jump to show the new
  // content. We cancel that out by growing `scrollTop` by exactly the inserted height.
  //
  // Timing: adding renderables only marks layout dirty; OpenTUI wouldn't compute the new
  // sizes until the next render frame, and letting that frame paint first is exactly the
  // flicker. So we force layout synchronously (calculateLayout runs yoga only, no paint),
  // measure the grown height, and scroll — all in one tick, before anything is drawn.
  //
  // Height comes from the yoga node, not `component.scrollHeight`, a cached mirror only
  // refreshed during a render frame. calculateLayout lives on the root renderable only, so
  // we walk up to it from the component.
  //
  // Two subtleties, both about the ScrollBox's *cached* view of its own size lagging the
  // freshly-computed yoga layout:
  //
  //   1. `verticalScrollBar.scrollSize` is that cached size and is only refreshed on a
  //      render frame (via onSizeChange -> recalculateBarProps). Setting scrollTop clamps
  //      against it, so without refreshing it first our target would be clamped to the
  //      *stale* (pre-insert) max — i.e. the old bottom. We refresh it to the just-measured
  //      height so the clamp uses the real range.
  //   2. That stale-max clamp is also what makes the bug specific to the first page: landing
  //      exactly on the stale bottom flips the box's internal `_hasManualScroll` to false,
  //      and on the next frame stickyScroll('bottom') snaps the view to the real bottom.
  //      Refreshing scrollSize (1) keeps the target off the bottom, so the box stays in its
  //      manually-scrolled state and never snaps. We also set scrollTop absolutely rather
  //      than via a relative scrollBy, so the result can't accumulate that clamp.
  preserveScroll: (component, mutate) => {
    const content = component.content.getLayoutNode();
    const heightBefore = content.getComputedLayout().height;
    const scrollTopBefore = component.scrollTop;

    mutate();

    let root = component;
    while (root.parent) root = root.parent;
    root.calculateLayout();

    const heightAfter = content.getComputedLayout().height;
    component.verticalScrollBar.scrollSize = heightAfter;
    component.scrollTop = scrollTopBefore + heightAfter - heightBefore;
  },
});
