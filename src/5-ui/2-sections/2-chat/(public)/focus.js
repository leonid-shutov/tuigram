/** @type {ChatSelf['focus']} */
() => {
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  self.selectMessage(self.selectedMessage);
};
