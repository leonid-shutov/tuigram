() => {
  self.dialogs = ui.sections.dialogs.getAll();
  self.input.replaceText('');
  self.input.setCursor(0, 0);
  self.filter('');
  self.component.visible = true;
  self.input.focus();
};
