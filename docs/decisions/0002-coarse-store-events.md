# ADR 0002: Coarse store events, idempotent repaints

## Status

Accepted.

## Context

Every store emits one `change` per mutation, with nothing about what changed, and each spot on
screen has one repaint subscribed to every store it reads (`src/10-subscriptions/store.js`). A
repaint reads everything it draws back from the state.

So repaints run on changes they don't care about. `repaintChat` reads the open chat's read mark
from `store.dialogs`, and so runs on every dialog change: a message in any other chat, every page
of the dialog list at startup. A no-op pass was still costly because `reconcile` wrote both
margins of every bubble on every pass, and opentui's setters schedule a render whatever the value.

## Options considered

- **Emit the changed chat ids with `change`**, and filter on them in the listener. Rejected: it is
  a second record of what changed, kept by hand next to the state. Every mutator has to report its
  ids right (`land` touches a page of dialogs, `receive`'s argument is a message, not an id), and
  one that doesn't skips a repaint silently. It also says which dialog changed, not what.
- **Gate the subscription on a selector** (`whenChanged(select, handler)`, the memoized-selector
  pattern behind `useSelector`). Sound, since it compares real state, but the selector has to
  match what the action reads, and it optimizes a cost nobody has measured. Kept in reserve.
- **React.** The same model plus a generic diff: every store change still runs every selector, and
  its bail-outs need an immutable store; ours mutates in place.
- **Solid, or signals.** Removes the over-firing: an effect reruns only when what it read changes,
  with no selector to keep in sync. Costs reactive state everywhere, harder "why did this run"
  debugging, a build step for JSX, and a rewrite of the UI layer.
- **Keep coarse events, make repaints cheap when nothing changed.** **Chosen.**

## Decision

1. Stores keep emitting a bare `change`; listeners trust only the state, never the event.
2. A repaint may run on any change of a store it reads, so it must be idempotent and cheap when
   nothing changed: it writes only what differs. `redate`, `Panel.setTitlePart` and the margins in
   `render`'s `reconcile` follow this; an unconditional write in a repaint is a bug.
3. One spot on screen has one repaint. A value fed by two stores is derived in one action
   subscribed to both, as `repaintChat` derives the unseen run from the messages and the read mark.

## Consequences

- No repaint can disagree with the state, and none depends on subscription order.
- Every repaint still runs on unrelated changes, as a read-only pass. If a profile ever shows one
  too costly, gate that subscription with a selector first, and look at signals only if gates
  start piling up.
