// The divider sits in the slot of the first new message, right above the bubble and so under its
// day separator: the slot's height cap then holds them together, the bubble giving up rows to
// them. Only a change is written: opentui's setters and `insertBefore` schedule a render whatever
// they're given.
/** @type {ChatSelf['placeDivider']} */
(count) => {
  const { divider } = self;
  const view = self.views.at(self.inboxUnreadFrom);
  if (view === null) {
    divider.parent?.remove(divider);
    return;
  }
  const title = ` ${count} new `;
  if (divider.title !== title) divider.title = title;
  if (divider.parent !== view.slot) view.slot.insertBefore(divider, view.box);
};
