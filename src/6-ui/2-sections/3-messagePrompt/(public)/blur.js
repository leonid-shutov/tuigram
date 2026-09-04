/** @type {MessagePromptSelf['blur']} */
() => {
  self.component.borderColor = config.theme.border;
  self.component.titleColor = config.theme.muted;
  ui.sections.messagePrompt.input.blur();
};
