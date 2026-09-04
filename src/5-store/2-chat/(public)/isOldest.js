/** @type {ChatStore['isOldest']} */
(id) => {
  const head = self.messages.head;
  if (head === null) return true;
  return id === head.value.id;
};
