/** @type {ChatSection['focus']} */
() => {
  self.focused = true;
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  self.selectMessage(self.selectedIndex);
  // An empty chat has no bubble to take focus, and the keymap layer needs something focused.
  if (self.selectedIndex < 0) self.component.focus();
};
