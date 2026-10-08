// One pass owns the invariant, so `render` never patches separators itself: a prepended batch
// ending on the day already at the top, a drop that empties a day, a message sent just before
// midnight all come out right. Labels are recomputed every pass, so "Today" corrects itself after
// midnight on the next change; only a changed label is written, since `content =` schedules a
// render.
/** @type {ChatSelf['redate']} */
() => {
  const seen = new Set();
  for (const { box, message } of self.views) {
    const key = Day.key(message.date);
    if (seen.has(key)) continue;
    seen.add(key);
    let separator = self.days.get(key);
    if (separator === undefined) {
      separator = Text({ fg: config.theme.muted, alignSelf: 'center', flexShrink: 0 });
      self.days.set(key, separator);
    }
    const label = `── ${Day.label(message.date)} ──`;
    if (separator.plainText !== label) separator.content = label;
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
