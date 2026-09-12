/** @type {ChatSection['focus']} */
() => {
  self.focused = true;
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  self.selectMessage(self.selectedIndex);
};
