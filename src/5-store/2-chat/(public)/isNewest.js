/** @type {ChatStore['isNewest']} */
(id) => {
  const tail = self.messages.tail;
  if (tail === null) return true;
  return id === tail.value.id;
};
