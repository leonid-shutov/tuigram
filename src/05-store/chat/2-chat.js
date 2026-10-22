// `openChatId` is the app's one record of which chat is open. The store stays synchronous, and
// every await stays in 08-actions.
//
// `ui.chat.render` matches bubbles to a chat's `messages` by id and identity, so two rules hold: a
// held message is never mutated, only swapped for a new copy, and held messages never change order
// — the window only grows at either end, loses entries, or swaps one in place.
({ openChatId: null, chats: new Map() });
