ui.sections.picker.on('pick', self.openChat);
ui.sections.picker.on('close', () => self.select('chat'));
ui.sections.picker.on('capture', (capturing) => (self.selectable = !capturing));
KeyInput.on('keypress', (e) => {
  if (self.selectable && e.raw === Keys.CTRL_P) {
    e.stopPropagation();
    self.select('picker');
  }
});
