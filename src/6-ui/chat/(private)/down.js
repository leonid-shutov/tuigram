/** @type {ChatSelf['down']} */
() => {
  if (self.selectedIndex >= self.scroll.getChildren().length - 1) return;
  self.selectMessage(self.selectedIndex + 1);
};
