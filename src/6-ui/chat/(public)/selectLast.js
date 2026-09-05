// Put the cursor on the newest message and pin the view to the bottom, as opening a chat does.
/** @type {ChatSection['selectLast']} */
() => {
  self.selectMessage(self.component.getChildren().length - 1);
  self.component.scrollTop = self.component.scrollHeight;
};
