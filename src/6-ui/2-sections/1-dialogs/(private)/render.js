/** @type {DialogsSelf['render']} */
() => {
  self.list.options = store.dialogs.all().map(Option.from);
};
