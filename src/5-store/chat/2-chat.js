// The window of messages currently held for the open chat, oldest first. `chatId` doubles
// as "which chat is open" for the whole app — there is no separate session state. The pager
// rides along because its lifetime is the open chat's; the store holds it but never advances
// it, so the store stays synchronous and every await stays in 8-actions.
({ chatId: null, messages: [], readUpTo: 0, pager: null });
