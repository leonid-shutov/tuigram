/** @type {typeof Dialog.toPickerItem} */
(dialog) => ({ name: dialog.name, description: Message.preview(dialog.lastMessage) ?? '', value: dialog.chatId });
