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
  // The keys line up in a column after the longest name.
  const width = Math.max(...request.options.map(({ name }) => Cells.width(name)));
  self.list.options = request.options.map(({ name, value, keys = '' }) => ({
    name: keys === '' ? name : `${Cells.fit(name, width)}  ${keys}`,
    description: '',
    value,
    marker: keys,
  }));
  self.list.height = Math.min(request.options.length, MAX_OPTIONS_SHOWN);
  self.list.setSelectedIndex(0);
};
