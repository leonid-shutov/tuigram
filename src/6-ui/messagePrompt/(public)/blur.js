/** @type {MessagePromptSection['blur']} */
() => {
  self.component.borderColor = config.theme.border;
  self.component.titleColor = config.theme.muted;
  self.input.blur();
};
