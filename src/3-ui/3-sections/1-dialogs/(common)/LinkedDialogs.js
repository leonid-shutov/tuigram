({
  from: (dialogs) => {
    const pinned = LinkedList.from(dialogs.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(dialogs.filter((d) => !d.isPinned));
    const isMatch = (chatId) => (d) => d.chatId === chatId;

    const findNode = (chatId) => pinned.findNode(isMatch(chatId)) ?? unpinned.findNode(isMatch(chatId));
    const find = (chatId) => findNode(chatId)?.value ?? null;

    // Move a dialog to the top of the unpinned list; pinned dialogs stay put.
    const bump = (node) => {
      if (!node.value.isPinned) unpinned.moveToFront(node);
    };

    const unshift = (dialog) => unpinned.unshift(dialog);

    return {
      find,
      findNode,
      bump,
      unshift,
      *[Symbol.iterator]() {
        yield* pinned;
        yield* unpinned;
      },
    };
  },
});
