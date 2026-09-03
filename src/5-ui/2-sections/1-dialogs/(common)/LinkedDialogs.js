/** @type {typeof LinkedDialogs} */
({
  from: (dialogs) => {
    // find/findNode/bump are all keyed by chatId, so a repeated id would make them ambiguous.
    // iterDialogs already dedupes the stream; this keeps the invariant true for any caller of
    // the public setDialogs. First occurrence wins — `new Map(entries)` would keep the last.
    const byChatId = new Map();
    for (const dialog of dialogs) if (!byChatId.has(dialog.chatId)) byChatId.set(dialog.chatId, dialog);
    const unique = [...byChatId.values()];

    const pinned = LinkedList.from(unique.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(unique.filter((d) => !d.isPinned));

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
