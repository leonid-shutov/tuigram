/** @type {ChatSection['close']} */
() => {
  self.spinner.stop();
  self.component.clearTitlePart('name');
  self.component.clearTitlePart('status');
  self.empty.visible = true;
};
