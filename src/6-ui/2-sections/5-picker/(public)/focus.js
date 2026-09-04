/** @type {PickerSelf['focus']} */
() => {
  self.dialogList = store.dialogs.all();
  self.input.replaceText('');
  self.input.setCursor(0, 0);
  self.filter('');
  self.component.visible = true;
  self.input.focus();
};
