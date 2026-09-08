// Move the cursor to a row of the ScrollBox, clamped to what is actually rendered.
//
// The cursor thickens the bubble's outline. It cannot be a fill: a terminal paints whole
// cells, and the bubble's outer ring of cells *is* its border, so filling them paints above
// and below the stroke while not filling them leaves a one-row stripe inside a three-row box.
// Thickness is a shape cue, which is what a border that only changed hue was missing — that
// was 1.3:1 against the borders around it on most themes.
//
// The bubble is held by reference rather than by index, because `prepend` inserts above the
// cursor and renumbers every child; an index kept from last time would restore the plain
// border on the wrong bubble.
/** @type {ChatSelf['selectMessage']} */
(index) => {
  if (self.selectedBubble !== null) self.selectedBubble.customBorderChars = config.borders.chars;
  self.selectedBubble = null;

  const children = self.scroll.getChildren();
  if (children.length === 0) {
    self.selectedIndex = -1;
    return;
  }
  const clamped = Math.max(0, Math.min(index, children.length - 1));
  self.selectedIndex = clamped;
  // eslint-disable-next-line no-extra-parens -- JSDoc type-assertion cast, not redundant
  const bubble = /** @type {import('@opentui/core').BoxRenderable} */ (children[clamped]);
  self.scroll.scrollChildIntoView(bubble.id);
  bubble.focus();
  bubble.customBorderChars = config.borders.cursorChars;
  self.selectedBubble = bubble;
};
