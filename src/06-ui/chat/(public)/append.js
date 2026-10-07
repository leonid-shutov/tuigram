/** @type {ChatSection['append']} */
(message) => {
  self.insert(message);
  self.redate();
};
