// From the bottom, the cursor's reveal does the rest: a first new message above the view brings
// its slot, divider on top, to the first row; one already in view leaves the chat stuck to the
// bottom. Nothing new, and `selectAt` clamps to the newest. The last scroll write is what sets or
// clears the manual-scroll latch for the first paint, as in `selectLast`.
/** @type {ChatSection['resume']} */
() => {
  ScrollBox.scrollToBottom(self.scroll);
  self.selectAt(self.inboxUnreadFrom);
};
