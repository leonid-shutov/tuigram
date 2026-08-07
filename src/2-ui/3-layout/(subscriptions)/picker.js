ui.sections.picker.on('pick', self.openChat);
ui.sections.picker.on('close', () => self.select('chat'));
void ui.sections.picker.on('capture', (capturing) => (self.selectable = !capturing));
