/** @type {ChatSection['selectLast']} */
() => {
  self.selectAt(self.views.length - 1);
  ScrollBox.scrollToBottom(self.scroll);
};
