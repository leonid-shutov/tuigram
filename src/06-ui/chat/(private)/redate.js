// One pass owns the invariant, so append, prepend and drop never patch separators themselves: a
// prepended batch ending on the day already at the top, a drop that empties a day, a message sent
// just before midnight all come out right. Labels are rewritten every pass, so "Today" corrects
// itself after midnight on the next change.
/** @type {ChatSelf['redate']} */
() => {
  /** @type {Map<import('@opentui/core').Renderable, BubbleView>} */
  const viewOf = new Map([...self.bubbles.values()].map((view) => [view.box, view]));
  const seen = new Set();
  for (const box of self.boxes) {
    const view = viewOf.get(box);
    if (view === undefined) continue;
    const { date } = view.message;
    const key = Day.key(date);
    if (seen.has(key)) continue;
    seen.add(key);
    let separator = self.days.get(key);
    if (separator === undefined) {
      separator = Text({ fg: config.theme.muted, alignSelf: 'center', flexShrink: 0 });
      self.days.set(key, separator);
    }
    separator.content = `── ${Day.label(date)} ──`;
    // `insertBefore` moves a child already in the scroll; skip it when it's already in place.
    const children = self.scroll.getChildren();
    if (children[children.indexOf(box) - 1] !== separator) self.scroll.insertBefore(separator, box);
  }
  for (const [key, separator] of self.days) {
    if (seen.has(key)) continue;
    self.days.delete(key);
    separator.destroy();
  }
};
