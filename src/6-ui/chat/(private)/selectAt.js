/** @type {ChatSelf['selectAt']} */
(index) => {
  const view = self.views.at(Math.max(0, Math.min(index, self.views.length - 1)));
  if (view === null) {
    self.selectedMessageId = null;
    self.paintDate();
    return;
  }
  self.selectedMessageId = view.message.id;
  // Only ever forward: going back up to re-read never brings the count back.
  if (Message.isConfirmed(view.message)) self.readUpTo = Math.max(self.readUpTo, ...view.message.partIds);
  self.paintDate();
  self.paintUnreadLeft();
  // The slot brings the bubble's day separator and the unread divider along with it.
  ScrollBox.reveal(self.scroll, view.slot);
  if (self.focused) view.box.focus();
};
