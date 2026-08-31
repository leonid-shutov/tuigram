/** @type {MessagePromptSelf['focus']} */
() => {
  self.component.borderColor = config.theme.accent;
  self.component.titleColor = config.theme.accent;
  input.focus();
  self.editor.focus?.();
};
