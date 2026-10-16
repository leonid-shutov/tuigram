// Past this many options the list scrolls instead of running the box off the screen.
const MAX_OPTIONS_SHOWN = 10;

/** @type {ChoiceSection['open']} */
(request) => {
  self.choosing = request;
  self.setLabel(request.title);
  self.message.content = request.message;
  self.message.visible = request.message !== '';
  self.body.content = request.body ?? '';
  self.body.visible = request.body !== undefined;
  self.list.options = request.options.map(({ name, value }) => ({ name, description: '', value }));
  self.list.height = Math.min(request.options.length, MAX_OPTIONS_SHOWN);
  self.list.setSelectedIndex(0);
};
