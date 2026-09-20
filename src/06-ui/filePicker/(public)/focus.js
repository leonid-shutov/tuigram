/** @type {FilePickerSection['focus']} */
() => {
  self.list.clearFilter();
  self.component.visible = true;
  self.list.focus();
};
