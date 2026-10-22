// What other people are doing right now, for every user and chat the stream reports on — not just
// the open chat, so a chat opens with its presence and typists already known. A status that holds
// only so long lapses here on its own, timed by the store: the stream never says when it ran out.
({ presence: new Map(), timers: new Map(), typing: new Map() });
