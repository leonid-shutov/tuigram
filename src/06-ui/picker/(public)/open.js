/** @type {PickerSection['open']} */
(request) => {
  self.request = request;
  self.setLabel(request.title);
  self.search.placeholder = request.placeholder;
  self.search.setItems(request.items);
};
