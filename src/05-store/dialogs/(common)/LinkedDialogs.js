/** @type {typeof LinkedDialogs} */
({
  from: (dialogs) => {
    // find/findNode/bump are all keyed by chatId, so a repeated id would make them ambiguous.
    // iterDialogs already dedupes the stream; this keeps the invariant true for any caller of
    // the public setDialogs. First occurrence wins.
    const unique = Dialog.unique(dialogs);

    const pinned = LinkedList.from(unique.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(unique.filter((d) => !d.isPinned));

    /** @param {number} chatId */
    const findNode = (chatId) =>
      pinned.findNode((d) => d.chatId === chatId) ?? unpinned.findNode((d) => d.chatId === chatId);

    return {
      find: (chatId) => findNode(chatId)?.value ?? null,
      findNode: (chatId) =>
        pinned.findNode((d) => d.chatId === chatId) ?? unpinned.findNode((d) => d.chatId === chatId),
      bump: (node) => {
        if (!node.value.isPinned) unpinned.moveToFront(node);
      },
      unshift: (dialog) => unpinned.unshift(dialog),
      *[Symbol.iterator]() {
        yield* pinned;
        yield* unpinned;
      },
    };
  },
});
