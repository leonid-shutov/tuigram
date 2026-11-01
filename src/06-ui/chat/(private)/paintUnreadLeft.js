// The new messages under the divider the cursor hasn't reached yet this visit, on the bottom
// border's right. They are all loaded, since the window always runs to the newest, so the count is
// exact even when the divider's isn't; the sent message that dismisses the divider clears it too.
/** @type {ChatSelf['paintUnreadLeft']} */
() => {
  const below = [...self.views].slice(self.inboxUnreadFrom).map(({ message }) => message);
  const left = Message.inboxUnreadCount(below, self.readUpTo);
  self.component.setTitlePart('unreadLeft', left === 0 ? '' : `↓ ${left} new`);
};
