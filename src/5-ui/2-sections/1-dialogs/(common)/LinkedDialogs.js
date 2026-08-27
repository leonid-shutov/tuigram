/** @type {typeof LinkedDialogs} */
({
  from: (dialogs) => {
    const pinned = LinkedList.from(dialogs.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(dialogs.filter((d) => !d.isPinned));

    /** @param {number} chatId */
    const findNode = (chatId) =>
      pinned.findNode((d) => d.chatId === chatId) ?? unpinned.findNode((d) => d.chatId === chatId);

    return {
      find: (chatId) => findNode(chatId)?.value ?? null,
      findNode: (chatId) =>
        pinned.findNode((d) => d.chatId === chatId) ?? unpinned.findNode((d) => d.chatId === chatId),
      // Move a dialog to the top of the unpinned list; pinned dialogs stay put.
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
