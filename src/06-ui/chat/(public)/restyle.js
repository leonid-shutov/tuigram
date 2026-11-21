// A post keeps the style it was built in, so a new `messageStyle` takes building them all again:
// every post goes, and the same messages, marks and cursor are rendered afresh. The divider and the
// day separators live in the slots, so the divider is taken out first to outlive them, and the
// separators go with their slots for `redate` to make anew.
/** @type {ChatSection['restyle']} */
() => {
  const messages = [...self.views].map(({ message }) => message);
  self.divider.parent?.remove(self.divider);
  self.days.clear();
  for (const view of self.views) view.slot.destroyRecursively();
  self.views = KeyedList.from([], (/** @type {PostView} */ view) => view.message.id);
  self.render(messages, self.marks);
  if (self.selectedMessageId !== null) self.selectAt(self.selectedIndex);
};
