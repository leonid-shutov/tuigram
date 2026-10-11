/** @type {MessagePromptSection['focus']} */
() => {
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  self.rule.fg = config.theme.accent;
  self.input.focus();
};
