/** @type {ChatSelf['down']} */
() => {
  if (self.selectedIndex >= self.component.getChildren().length - 1) return;
  self.selectMessage(self.selectedIndex + 1);
};
