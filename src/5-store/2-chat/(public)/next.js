/** @type {ChatStore['next']} */
(id) => {
  if (id === null) return null;
  const node = self.messages.findNode((message) => message.id === id);
  return node?.next?.value.id ?? null;
};
