# Replacing `ui.chat.connect`

Investigation of `src/6-ui/chat/(public)/connect.js` and proposals for removing it.

## What's actually wrong with it

`src/6-ui/chat/(public)/connect.js` is the only place in the app that uses push-injection.
Concretely:

1. **It's a second wiring mechanism.** Every other section reports upward through `Emitter` +
   `(public)/on.js`, and every cross-layer wire lives in `9-subscriptions/`. Chat alone gets a
   bespoke setter, called from `start.js` — away from all the other wiring.
2. **It forces stubs.** `1-chat.js:11-12` carries `async () => {}` / `async () => null` purely to
   cover the gap before `connect` runs.
3. **It conflates two opposite directions.** `loadOlder` is *outgoing intent* ("I hit the top") —
   identical in shape to `dialogs`' `open` event. `loadThumb` is an *incoming fetch*. One
   mechanism serving both is why neither fits.
4. **It leaks into the type surface.** `ChatDeps` is intersected into `ChatSection`, so
   `loadOlder`/`loadThumb` read as public API.
5. **Latent bug:** `connect.js` does `self.loadOlder = loadOlder`, which is exactly the shadowing
   trap — `self` is `Object.create(container)`, so this creates an own property on `self` and
   `ui.chat.loadOlder` stays the no-op stub forever. It works today only because both readers
   (`up.js`, `Picture.js`) are inside the module. The type says otherwise.

## Option A — split by direction (recommended)

The insight: `5-store/chat/2-chat.js` already states the principle — *"the store stays synchronous
and every await stays in 8-actions."* `connect` exists because `6-ui/chat` broke that rule. Restore
it and `connect` has nothing left to do.

### A1. `loadOlder` becomes an event

Chat gets what every other section has:

```js
// src/6-ui/chat/3-events.js
Emitter();

// src/6-ui/chat/(public)/on.js
/** @type {ChatSection['on']} */
(event, handler) => {
  self.events.on(event, handler);
};

// src/9-subscriptions/chat.js
ui.chat.on('reachTop', actions.loadOlder);
```

`up.js` stops being async — it emits and lets `prepend` shift the cursor:

```js
/** @type {ChatSelf['up']} */
() => {
  if (self.selectedIndex <= 0) return void self.events.emit('reachTop');
  self.selectMessage(self.selectedIndex - 1);
  // prefetch once the cursor nears the top of the window
  if (self.selectedIndex < 10) self.events.emit('reachTop');
};
```

Trade-off worth naming: you lose the `await` at `up.js:3`, so pressing `k` at index 0 with unloaded
history doesn't move the cursor on that keypress — the page lands and `prepend` shifts it, and the
next `k` moves. The `selectedIndex < 10` prefetch means you virtually never *reach* index 0 with an
unloaded page, so this is a rare-race behaviour, not the common path. If you want the await back,
the alternative is `emit` returning `Promise.all(listeners.map(...))` — I'd avoid it; it makes every
fire-and-forget emit return a floating promise.

### A2. `loadThumb` inverts to a push, like `confirm`

The chat section already has the exact pattern for "an async thing landed late, update this bubble":
`confirm(tempId, messageId)` and `setReceipt`. Thumbnails are the same shape.

`Picture.js` becomes pure — build the `Image` from `media.preview`, return it, no `.then`.
`append`/`prepend` file the image in a `pictures: Map<number, ImageRenderable>` alongside `bubbles`,
and:

```js
// src/6-ui/chat/(public)/setThumb.js
/** @type {ChatSection['setThumb']} */
(messageId, bytes) => {
  const image = self.pictures.get(messageId);
  if (image !== undefined) image.source = bytes;
};

// src/8-actions/loadThumbs.js
/** @type {Actions['loadThumbs']} */
(messages) => {
  for (const { id, media } of messages) {
    const thumbId = media !== null && 'thumbId' in media ? media.thumbId : null;
    if (thumbId === null) continue;
    void messenger.downloadThumb(thumbId).then((bytes) => {
      if (bytes !== null) ui.chat.setThumb(id, bytes);
    });
  }
};
```

Called from the three places that already push messages into the view (`loadChat`, `loadOlder`,
`receiveMessage`) — one line each. Bonus: the "chat was switched out from under us" guard stops
needing `image.isDestroyed`; `clear()` empties `pictures`, so a late `setThumb` is a natural no-op.

**Net:** `connect.js`, `ChatDeps`, both stubs, and the `start.js` call all delete. `start.js` goes
back to only kicking the app into motion. `6-ui/chat` becomes fully synchronous and dependency-free,
and every section ends up the same shape.

## Option B — minimal, if A2 is more surgery than you want

Do A1 only, and for thumbs keep injection but stop making it special: delete `connect`, and let
`9-subscriptions/chat.js` own both wires.

```js
// src/9-subscriptions/chat.js
ui.chat.on('reachTop', actions.loadOlder);
ui.chat.loadThumb = messenger.downloadThumb; // assign through the module path, not self
```

Two files touched, the outlier call in `start.js` is gone, all wiring lives in layer 9, and the
assignment goes through `ui.chat` so it actually lands on the module. `1-chat.js` keeps one stub
instead of two.

## Option C — the uncommonjs trick that tempts you (and I'd skip)

`(getters)/` defers evaluation past load order, so `connect` collapses to two one-line files:

```js
// src/6-ui/chat/(getters)/loadOlder.js
() => actions.loadOlder;
```

Mechanically elegant — no injection, no stubs, no `start.js` call. But it makes
`grep -r actions src/6-ui` and `grep -r messenger src/6-ui` non-empty, which is the invariant
`1-chat.js:7` exists to protect. Worth knowing the tool; only reach for it if you decide that rule
isn't paying for itself.

## Rejected outright

Generalizing `connect` into a `ports.js`/`connect()` convention across all sections. It
institutionalizes the second mechanism instead of removing it, when only one section ever needed it
— and only because it was doing async work the store layer already established belongs in
`8-actions`.

## Recommendation

Option A. It deletes the mechanism rather than tidying it, and it lands the chat section on the two
patterns already in the codebase — `on`/`Emitter` for intent out, `set*`/`confirm` for late data in.
A1 and A2 are independent, so it can go in two steps.
