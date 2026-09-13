/** @type {ChatSection['selectLast']} */
() => {
  self.selectMessage(self.scroll.getChildren().length - 1);
  ScrollBox.scrollToBottom(self.scroll);
};
