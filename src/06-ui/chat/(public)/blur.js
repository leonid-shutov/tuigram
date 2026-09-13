/** @type {ChatSelf['blur']} */
() => {
  self.focused = false;
  self.component.borderColor = config.theme.border;
  self.component.titleColor = config.theme.muted;
};
