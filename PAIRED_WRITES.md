# Paired writes: `store.chat.append(x); ui.chat.append(x);`

**Question:** actions repeat themselves against both `store` and `ui`. Is that good or bad?

**Verdict:** good — and it is the load-bearing part of the design, not an accident of it.

## Why it is good here

The numbered layers make `5-store` and `6-ui` peers that never see each other.
`6-ui/chat/1-chat.js` says so explicitly ("the section stays unaware that a store exists",
`grep -r messenger src/6-ui` is empty). That property is *bought* with the duplication in
`8-actions`. There is no free version of it.

The other direction is already split cleanly: views emit through `Emitter`
(`6-ui/*/events.js`), `9-subscriptions` turns those into action calls, and actions push back
down with direct calls. **Events up, commands down.** The paired writes are the "down" half
doing its job — the action is the only thing in the app that knows both a store and a view
exist, which is why it is the only place to look when append ordering is wrong.

The duplication is also small: four append/prepend pairs (`send`, `receiveMessage`,
`loadChat`, `loadOlder`) plus one `confirm` pair. Not a pattern straining under load.

## The tempting fix that would make it worse

Making the store observable — `store.chat.on('append', …)`, `ui.chat` subscribes — removes
the two lines and costs `loadChat.js`. That function currently reads as: build the pager,
open the store, clear the view, await, *re-check `store.chat.chatId` because the user may
have switched chats*, then fill both. Under a subscription that ordering becomes emergent,
and the staleness guards (`if (store.chat.chatId !== chatId) return`) have nowhere obvious
to live. Five visible lines traded for an invisible ordering contract. Don't.

## The line that actually is a problem

Not `append`. This one:

```js
ui.chat.setReceipt(store.chat.receipt());
```

Four call sites: `send.js:10`, `send.js:15`, `receiveMessage.js:9`, `loadChat.js:18`,
`historyRead.js:6`.

It differs in kind from the append pair:

- The append pair is **symmetric** — two sides of one fact, adjacent lines, and omitting the
  `ui` half produces a visibly missing bubble.
- The receipt line is **derived state**, and omitting it produces a silently stale footer.
  Nothing crashes, nothing looks obviously wrong. That is the failure mode duplication is
  bad at.

This shape is already solved once, for dialogs. `repaintDialogs.js` says it outright:
*"every mutation of `store.dialogs` is immediately followed by this. Both consumers of the
list are fed from one place."* The chat receipt is the same funnel, unfunnelled. Add its
twin:

```js
// src/8-actions/repaintReceipt.js
/** @type {Actions['repaintReceipt']} */
() => {
  ui.chat.setReceipt(store.chat.receipt());
};
```

Four sites become `self.repaintReceipt()`, the UI-facing side stops reaching through
`store.chat`, and it matches the convention the dialogs half of the app already follows.

## Where the line is

Chat cannot use the full funnel that dialogs uses (`render(all())`), because re-rendering
bubbles would throw away scroll position, focus, and decoded thumbnails. So incremental
dual-writes are correct for chat and a funnel is correct for dialogs. That asymmetry is
justified, not drift.

The pairing goes bad when a store mutation can reach the UI through more than one path, or
when the two calls stop being adjacent lines in the same function. Today every pair is two
consecutive lines in `8-actions`, so a reviewer sees a missing half immediately.

**Rule to keep:** one action, one screen, both writes visible.
