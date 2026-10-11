/** @type {MessagePromptSection['blur']} */
() => {
  self.component.borderColor = config.theme.border;
  self.component.titleColor = config.theme.muted;
  self.rule.fg = config.theme.border;
  self.input.blur();
};
