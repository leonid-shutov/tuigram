Mutation(
  self,
  /** @type {DialogsStoreSelf['land']} */
  (dialogs) => {
    for (const dialog of dialogs) {
      const early = self.find(dialog.chatId);
      if (early === null) (dialog.isArchived ? self.archive : self.list).push(dialog);
      else {
        const { name, kind, isUser, isContact, isMuted } = dialog;
        Object.assign(early, { name, kind, isUser, isContact, isMuted });
      }
    }
  },
);
