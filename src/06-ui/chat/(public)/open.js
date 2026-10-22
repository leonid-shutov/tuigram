// The border's name, receipt and presence follow from the store, which repaints them as it opens
// the chat; what goes here is the pane's own state.
/** @type {ChatSection['open']} */
() => {
  self.render([]);
  self.spinner.stop();
  self.component.clearTitlePart('status');
};
