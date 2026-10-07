/** @type {ChatSection['selectLast']} */
() => {
  self.selectMessage(self.boxes.length - 1);
  ScrollBox.scrollToBottom(self.scroll);
};
