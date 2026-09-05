/** @type {ChatSection['focus']} */
() => {
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  self.selectMessage(self.selectedIndex);
};
