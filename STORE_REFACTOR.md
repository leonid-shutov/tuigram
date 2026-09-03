# Extract a store layer out of the UI sections

## Context

Today the UI sections in `src/5-ui/` own the application's data, not just its rendering. Four
concrete tangles follow from that:

1. **`1-dialogs` is the dialog database.** It holds `self.dialogs` (a `LinkedDialogs`) and
   `self.archived`, and its public API is half view (`focus`/`blur`/`key`/`setLabel`) and half
   data (`getAll`/`isMuted`/`isArchived`/`markRead`/`setUnread`/`onMessage`/`setDialogs`).
   You already flagged this — `src/5-ui/3-layout/(subscriptions)/messenger.js:8` carries
   `// TODO: consider moving dialogs (data) out of dialogs ui section`.
2. **A UI section reads another UI section for data.** `5-picker/(public)/focus.js` calls
   `ui.sections.dialogs.getAll()` and snapshots it into `self.dialogList`. The picker doesn't
   want the dialogs *pane*; it wants the dialog *list*.
3. **Domain objects carry renderables.** `types/sections.ts` defines
   `ChatMessage = (Message | PendingMessage) & { bubble?: BoxRenderable }`, and
   `confirmMessage` has to do `{ ...confirmedMessage, bubble: node.value.bubble }` to preserve it.
   The chat section owns `messages`, `readUpTo`, `iterator` and `loadingMore` alongside its
   ScrollBox.
4. **Two sources of truth for "which chat is open."** `3-layout/1-layout.js` holds
   `openedChatId`; `2-chat` separately knows via `self.iterator`. Messenger side effects
   (`readHistory`) are decided in the layout's key/subscription code.

A symptom of all four is `AppSelf` in `types/sections.ts`: one flat intersection of every
section's `self`, with a `SelfConflicts` escape hatch because the shapes collide.

**Outcome:** a new `src/5-store/` layer owns dialogs, the open conversation, and `openedChatId`,
subscribes to `messenger` itself, and emits change events. UI sections in `src/6-ui/` become
projections — renderables, focus, keys, and a subscription that re-renders. `layout` shrinks to
focus and shortcuts.

## Decisions taken

- Full store layer, `src/5-ui` renumbered to `src/6-ui` so the store loads first.
- Store emits, UI subscribes (the `3-messagePrompt` EventEmitter pattern, moved to `(private)/`).
- `UiDialog` is collapsed: the store holds the domain `Dialog` with its full
  `lastMessage: Message | null`; the preview string is derived at render time.

## Loader rules this plan depends on

Confirmed by reading `node_modules/@leonid-shutov/uncommonjs/lib/loader.js` and `lib/util.js`:

- Within a directory, **every subdirectory loads before every file**; each group is sorted by
  `localeCompare`, with `(common)` hoisted first. `localeCompare` puts `(...)` names *before*
  numbered ones — so `(private)` < `(public)` < `(subscriptions)` < `1-x` < `2-y`.
- Consequence: anything in `(subscriptions)/` runs before the numbered files of the same
  module. **Every subscription body must be deferred** — subscribe with
  `store.dialogs.on('changed', () => self.render())`, never `on('changed', self.render)`.
- `foo/foo.js` merges into the module container, so its members are visible to siblings through
  `self`'s prototype chain (precedent: `3-layout/1-layout.js`).
- A `(common)/` directory loads into its **parent module's** context, not the root sandbox —
  so `5-store/(common)/` is store-only and `6-ui/(common)/` is ui-only, exactly like
  `5-ui/(common)/Media` today. Anything two UI sections both need must live in `6-ui/(common)/`.
- A file whose last expression is `undefined` adds no key (`loadFile` returns early), which is
  what makes `(subscriptions)` files and `2-labels.js` work.

## The new layer: `src/5-store/`

```
(common)/
  LinkedDialogs.js          moved from 5-ui/2-sections/1-dialogs/(common)/, retyped over Dialog
  Message/pending.js        moved from 5-ui/(common)/Message/, now (text, chatId, chatName)
(subscriptions)/
  messenger.js              onNewMessage + onHistoryRead, moved out of 5-ui/3-layout
1-dialogs/
  dialogs.js                ({ list: LinkedDialogs.from([]), archived: new Set() })
  (private)/events.js       new node.events.EventEmitter()
  (private)/emit.js
  (public)/                 all, applyMessage, find, isArchived, isMuted, load, markRead,
                            on, set, setArchived, setUnread
2-chat/
  chat.js                   ({ chatId: undefined, messages: LinkedList.from([]),
                               readUpTo: 0, iterator: undefined, loadingMore: false })
  (private)/events.js, emit.js, clear.js
  (public)/                 all, append, confirm, isNearOldest, isOldest, loadOlder, newest,
                            next, on, open, prev, send, setReadUpTo
```

No `@opentui/core` reference may appear anywhere under `5-store/`. That is the invariant the
whole refactor buys, and it is trivially greppable.

State stays `self`-private by convention (`self.list`, `self.messages`) and is reached from
outside only through functions — note that `self` is `Object.create(container)`, so a write like
`self.list = …` shadows rather than updates the container property, which is why nothing outside
may read `store.dialogs.list` directly. This is already how `setDialogs.js`/`getAll.js` behave;
the refactor just makes the types stop claiming otherwise.

### Events

- `store.dialogs`: `changed` (list content changed — UI re-renders every option) and `message`
  (a new message survived the archive filter; carries the `Message`).
- `store.chat`: `opened` `{ chatId, messages }`, `appended` `(message)`,
  `prepended` `(messages)`, `confirmed` `{ tempId, message }`, `receipt` `()`.

### Behaviour that moves into the store

- `5-ui/3-layout/(subscriptions)/messenger.js` becomes `5-store/(subscriptions)/messenger.js`.
  The archive filter (`isArchived` → drop) becomes store policy; the open-chat auto-read
  (`markRead` + `messenger.readHistory`) becomes store policy. Only the OS notification stays in
  the UI.
- `5-ui/3-layout/4-loadDialogs.js`'s three `iterDialogs` calls become `store.dialogs.load()`.
- `2-chat/(public)/open.js` (clear, `getHistory`, `getReadOutboxMaxId`) becomes
  `store.chat.open(chatId)`, which no-ops when `chatId` is already open, marks the dialog read,
  and fires `readHistory` — absorbing the guard currently in `3-layout/(private)/openChat.js`.
- `2-chat/(private)/loadMore.js` becomes `store.chat.loadOlder()`, which emits `prepended`
  rather than touching the ScrollBox.
- The send round-trip currently in `3-layout/(subscriptions)/messagePrompt.js` becomes
  `store.chat.send(text)`: pending message → `messenger.sendMessage` → `confirm` →
  `store.dialogs.applyMessage`.

### Cursor navigation stays id-based

The chat UI keeps a `selectedId: number | null`, never a `LinkedListNode` into the store's list.
The store exposes `prev(id)`, `next(id)`, `newest()`, `isOldest(id)`, `isNearOldest(id, n)` —
the same `LinkedList` operations `up.js`/`down.js` use today
(`src/(common)/(data-structures)/LinkedList.js` is root-common and needs no change).

## `src/6-ui/` (renamed from `src/5-ui`)

`git mv src/5-ui src/6-ui`. Then, per section:

**`2-sections/1-dialogs`** — delete `(public)/getAll|isArchived|isMuted|markRead|onMessage|setArchived|setDialogs|setUnread.js`
and `(common)/UiDialog/from.js|fromMessage.js`. Keep the renderables (`1-list.js`,
`2-component.js`), `capturing.js`, `(public)/blur|focus|key|on|select|setLabel.js`, and
`(common)/Emoji/`. `(common)/UiDialog/toOption.js` becomes `(common)/Option/from.js`
(unchanged arithmetic — the `panelWidth - 4` and `Emoji` width comments must survive verbatim),
taking a `Dialog` and calling the shared preview helper. `(private)/render.js` becomes
`self.list.options = store.dialogs.all().map(Option.from)`. Add
`(subscriptions)/store.js` → `store.dialogs.on('changed', () => self.render())`.

**`2-sections/2-chat`** — delete `(private)/clear|loadMore.js` and
`(public)/addMessage|addPendingMessage|confirmMessage|open|setReadUpTo.js`. `Bubble.js`,
`Picture.js`, `component.js`, `senderColor.js`, `scrollToBottom.js` are unchanged. Add
`(private)/bubbles.js` (`new Map()`), `(private)/mount.js` (build a bubble and register it), and
`(subscriptions)/store.js`:

| store event | UI reaction |
| --- | --- |
| `opened` | destroy children, clear `bubbles`, mount each message, select newest, `scrollToBottom` |
| `appended` | mount at the end, `renderReceipt` |
| `prepended` | `ScrollBox.preserveScroll(self.component, …)` + `self.component.add(bubble, 0)` per message, oldest-at-head order preserved |
| `confirmed` | re-key `bubbles` from `tempId` to `message.id`; move `selectedId` if it pointed at `tempId` |
| `receipt` | `renderReceipt()` |

`renderReceipt.js` reads `store.chat.newest()` and the store's `readUpTo` instead of
`self.messages.tail`. `up.js`/`down.js` drive `selectedId` through the store's navigation
helpers and call `store.chat.loadOlder()` at the head.

**`2-sections/5-picker`** — `(public)/focus.js` reads `store.dialogs.all()`;
`(private)/filter.js` derives its description through the shared preview helper. No other change.

**`3-layout`** — `1-layout.js` keeps `selected` and `shortcuts`, drops `openedChatId` (it must
keep starting with `({` — see `TYPING_GOTCHAS.md`). `(private)/openChat.js` reduces to
`store.chat.open(chatId)` + `ui.sections.dialogs.select(chatId)` + `self.select('chat')`.
`(subscriptions)/messenger.js` is deleted; a new `(subscriptions)/store.js` keeps the
notification policy (`store.dialogs.on('message', …)` filtered by `isMuted`, `sender.isSelf`,
and `store.chat.chatId`) and calls the unchanged `(private)/notifyMessage.js`.
`(subscriptions)/messagePrompt.js` becomes `on('send', (text) => store.chat.send(text))`.
`4-loadDialogs.js` becomes `void store.dialogs.load();` — **the kickoff stays here, in the
last-loaded layer**, so the UI is already subscribed before any dialog page can resolve.

**`(common)/`** — `Media/placeholder.js` and `Media/size.js` stay. `Message/pending.js` moves to
the store. Add `Preview/from.js` (`(message: Message | null) => string`, the body of today's
`UiDialog/preview.js`, using `Media.placeholder`) — it must live at `6-ui/(common)/` because
both `1-dialogs` and `5-picker` need it and a section-level `(common)/` is not shared laterally.

## Types

- `types/domain.ts` — delete `UiDialog` and `PendingMessage`; retype `LinkedDialogsHandle` over
  `Dialog`; keep `DialogOption`. `Message.pending` now returns a plain `Message` with
  `pending: true`, since the store knows `chatId`/`chatName` — that is what makes
  `PendingMessage` (and the `Message | PendingMessage` union threaded through the chat)
  disappear.
- `types/store.ts` (new) — `DialogsStore`/`DialogsStoreSelf`, `ChatStore`/`ChatStoreSelf`, the
  two event maps, and `namespace store { const dialogs; const chat }`.
- `types/sections.ts` — `DialogsSection` loses every data member; `ChatSection` loses
  `messages`/`readUpTo`/`iterator`/`loadingMore` and gains `selectedId`/`bubbles`;
  `ChatMessage` is deleted; `LayoutModule` loses `openedChatId`; `AppSelf` gains the two store
  selfs.
- `types/global.ts` — update the `Message.pending` signature, drop the `UiDialog` namespace, add
  `Preview` and `Option`.

`TYPING_GOTCHAS.md` applies to every new file: all `src/**/*.js` share one script-mode global
type scope, so no new top-level `const` may reuse a common name (`state`, `list`, `events`,
`source`…), and any new arrow function whose first parameter is destructured
(`({ chatId }) => …`) must carry a leading JSDoc annotation or the loader will misclassify it as
an object module and give it a private `self`.

## Sequencing

Land as three commits so a bad one can be bisected against a pty run:

1. `5-store/1-dialogs` + `(subscriptions)/messenger.js` + the dialogs/picker/layout UI changes,
   with `5-ui` → `6-ui` and the type split. Chat still owns its own messages.
2. `5-store/2-chat` and the chat section rewrite (bubble map, `selectedId`, `(subscriptions)/store.js`).
3. `openedChatId` removal from layout and the `store.chat.send` consolidation.

## Verification

No test suite (see the project memory note). After each commit:

1. `npm run lint && npm run types` — both must be clean.
2. `grep -rn "@opentui" src/5-store/` must return nothing; `grep -rn "ui\.sections" src/5-store/`
   must return nothing.
3. Drive the real app through a pty and diff against a `git stash` baseline, per the recorded
   workflow: put the run in a script under the scratchpad, launch with
   `script -qec "node --experimental-ffi --env-file=.env tuigram.js" /dev/null`, background it
   and `pkill -f experimental-ffi` (never `pkill -f tuigram.js` — it matches the tool's own
   shell). **Back up `~/.config/tuigram/credentials.json` first, and dry-run with no keystrokes
   to confirm the session is live before sending any** — an expired session shows the credentials
   form and piped keys will overwrite that file. **Never send Enter while `messagePrompt` is
   focused**; it posts a real Telegram message.
4. `~/.local/state/tuigram/tuigram.log` is truncated at startup — an empty log is a clean run.
5. Manual checks, in order: dialogs list renders with previews and unread dots; `Ctrl-P` picker
   lists the same chats; opening a chat clears the unread dot and marks it read; `k` at the top
   of the chat pages in older messages *without the viewport jumping* (this is the
   `ScrollBox.preserveScroll` path, the most fragile part of commit 2); an incoming message in a
   muted chat draws no OS notification; sending a message shows a bubble immediately and the
   read receipt flips.
