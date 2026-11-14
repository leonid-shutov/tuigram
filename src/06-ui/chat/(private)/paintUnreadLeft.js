// The new messages under the divider the cursor hasn't reached yet this visit and that aren't fully
// on screen, on the bottom border's right: the arrow says there's more to scroll down to, so news
// already in view isn't counted, though the cursor reaching it is still what marks it read. They
// are all loaded, since the window always runs to the newest, so the count is exact even when the
// divider's isn't; the sent message that dismisses the divider clears it too.
//
// Run after every layout (2-scroll.js), as what is on screen moves with any scroll or resize, and
// bubble positions are only settled there. A changed count shows from the next frame: the border
// is drawn before the bubbles.
/** @type {ChatSelf['paintUnreadLeft']} */
() => {
  const { viewport } = self.scroll;
  const bottom = viewport.screenY + viewport.height;
  const below = [...self.views]
    .slice(self.inboxUnreadFrom)
    .filter(({ box }) => box.screenY + box.height > bottom)
    .map(({ message }) => message);
  const left = Message.inboxUnreadCount(below, self.readUpTo);
  self.component.setTitlePart('unreadLeft', left === 0 ? '' : `↓ ${left} new`);
};
