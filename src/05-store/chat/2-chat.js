// `chatId` doubles as "which chat is open" for the whole app — there is no separate session
// state. The store holds the pager but never advances it, so it stays synchronous and every
// await stays in 8-actions.
({ chatId: null, messages: [], readUpTo: 0, pager: null });
