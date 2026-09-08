// Put the cursor on the newest message and pin the view to the bottom, as opening a chat does.
/** @type {ChatSection['selectLast']} */
() => {
  self.selectMessage(self.scroll.getChildren().length - 1);
  self.scroll.scrollTop = self.scroll.scrollHeight;
};
