/** @type {() => DialogsSection['selectedChatId']} */
() => self.list.getSelectedOption()?.chatId ?? null;
