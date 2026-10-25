// The border's name and presence, the 🙈 bar and the divider follow from the store, which repaints
// them as it opens the chat; what goes here is the pane's own state.
/** @type {ChatSection['open']} */
() => {
  self.render([], { outboxUnreadFrom: 0, inboxUnreadFrom: 0, inboxUnreadCount: 0 });
  self.spinner.stop();
  self.component.clearTitlePart('status');
};
