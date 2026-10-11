/** @type {ChoiceSection['open']} */
(request) => {
  self.choosing = request;
  self.setLabel(request.title);
  self.message.content = request.message;
  self.list.options = request.options.map(({ name, value }) => ({ name, description: '', value }));
  self.list.height = request.options.length;
  self.list.setSelectedIndex(0);
};
