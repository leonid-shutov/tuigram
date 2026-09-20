/** @type {FilePickerSection['blur']} */
() => {
  self.component.visible = false;
  self.list.blur();
};
