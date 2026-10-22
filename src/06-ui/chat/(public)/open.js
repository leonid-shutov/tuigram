// The border's name and presence, and the unseen bar, follow from the store, which repaints them as
// it opens the chat; what goes here is the pane's own state.
/** @type {ChatSection['open']} */
() => {
  self.render([], 0);
  self.spinner.stop();
  self.component.clearTitlePart('status');
};
