/** @type {MessagePromptSelf['focus']} */
() => {
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  ui.sections.messagePrompt.input.focus();
};
