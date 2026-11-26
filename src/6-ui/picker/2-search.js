const search = SearchList({ id: 'pickerSearch', flexGrow: 1, theme: config.theme });

// opentui's Select handles no mouse of its own: a click on a row picks it, as Enter does.
search.list.onMouseDown = (event) => {
  if (event.button !== 0) return;
  const index = SelectRow(search.list, event.y);
  if (index === -1) return;
  // Keep opentui from focusing the list after the click: the pick closes the picker.
  event.preventDefault();
  search.list.setSelectedIndex(index);
  self.pick();
};

search;
