// `chatId` doubles as "which chat is open" for the whole app — there is no separate session
// state. The store holds the pager but never advances it, so it stays synchronous and every
// await stays in 8-actions.
//
// `ui.chat.render` reconciles bubbles against `messages` by id and identity, so two rules hold:
// a held message is never mutated, only swapped for a new copy, and held messages never change
// order — the window only grows at either end, loses entries, or swaps one in place.
({ chatId: null, messages: [], readUpTo: 0, pager: null, presence: null });
