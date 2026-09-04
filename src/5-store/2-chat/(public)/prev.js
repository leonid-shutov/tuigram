// The next older message's id, or null at the head. Ids, not nodes: the chat section must never
// hold a LinkedListNode into this list.
/** @type {ChatStore['prev']} */
(id) => {
  if (id === null) return null;
  const node = self.messages.findNode((message) => message.id === id);
  return node?.prev?.value.id ?? null;
};
