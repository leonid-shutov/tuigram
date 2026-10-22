/** @type {typeof LinkedDialogs} */
({
  from: (dialogs) => {
    // find/findNode/bump are all keyed by chatId, so a repeated id would make them ambiguous: the
    // first occurrence wins here, and `push` is for a chat the list doesn't have.
    const unique = Dialog.unique(dialogs);

    const pinned = LinkedList.from(unique.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(unique.filter((d) => !d.isPinned));

    /** @param {number} chatId */
    const findNode = (chatId) =>
      pinned.findNode((d) => d.chatId === chatId) ?? unpinned.findNode((d) => d.chatId === chatId);

    return {
      find: (chatId) => findNode(chatId)?.value ?? null,
      findNode,
      bump: (node) => {
        if (!node.value.isPinned) unpinned.moveToFront(node);
      },
      unshift: (dialog) => unpinned.unshift(dialog),
      push: (dialog) => (dialog.isPinned ? pinned : unpinned).push(dialog),
      *[Symbol.iterator]() {
        yield* pinned;
        yield* unpinned;
      },
    };
  },
});
