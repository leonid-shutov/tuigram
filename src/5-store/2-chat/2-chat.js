// The window of messages currently held for the open chat, oldest first. `chatId` doubles
// as "which chat is open" for the whole app — there is no separate session state.
({ chatId: null, messages: [], readUpTo: 0 });
