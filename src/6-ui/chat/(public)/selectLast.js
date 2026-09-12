/** @type {ChatSection['selectLast']} */
() => {
  self.selectMessage(self.scroll.getChildren().length - 1);
  self.scroll.scrollTop = self.scroll.scrollHeight;
};
