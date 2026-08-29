// @ts-check
/** @typedef {import('../../../../../types/domain').UiDialog} UiDialog */
/** @typedef {import('../../../../../types/collections').LinkedListNode<UiDialog>} UiDialogNode */

/** @type {typeof LinkedDialogs} */
({
  from: (dialogs) => {
    const pinned = LinkedList.from(dialogs.filter((d) => d.isPinned));
    const unpinned = LinkedList.from(dialogs.filter((d) => !d.isPinned));
    /** @param {number} chatId */
    const isMatch = (chatId) => (/** @type {UiDialog} */ d) => d.chatId === chatId;

    /** @param {number} chatId */
    const findNode = (chatId) => pinned.findNode(isMatch(chatId)) ?? unpinned.findNode(isMatch(chatId));
    /** @param {number} chatId */
    const find = (chatId) => findNode(chatId)?.value ?? null;

    // Move a dialog to the top of the unpinned list; pinned dialogs stay put.
    /** @param {UiDialogNode} node */
    const bump = (node) => {
      if (!node.value.isPinned) unpinned.moveToFront(node);
    };

    /** @param {UiDialog} dialog */
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
