import * as _opentui from '@opentui/core';
import * as _events from 'node:events';
import { KeyedList as _KeyedList } from './collections';
import {
  Dialog,
  DialogOption as _DialogOption,
  Entity,
  ImageMedia,
  Media as _Media,
  Message,
  Presence,
} from './domain';

declare global {
  type DialogOption = _DialogOption;

  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
    /** `dialogsWidth` is the dialogs pane's current width, changed by `ui.dialogs.resize`, within `dialogsMin..dialogsMax`. */
    size: { width: number; height: number; dialogsWidth: number; dialogsMin: number; dialogsMax: number };
    /** The startup placeholder; `destroy()` is idempotent. */
    splash: _opentui.TextRenderable;
    /** True in a terminal known to draw `◖` / `◗` as round ends; read at paint time. */
    drawsHalfDiscs: boolean;
  };

  type ScreenSelf = ScreenModule & {
    /** The share of the screen the dialogs pane was last left at, read from disk; null when none is saved. */
    savedDialogsRatio: number | null;
  };

  /**
   * Everything outside a section may use: navigation moves focus between them, and the keymap's
   * commands call the named intents each section adds on top.
   */
  type Section = {
    focus(): void;
    blur?(): void;
    setLabel(label: string): void;
  };

  /**
   * A section's own event source, created on first use. Both members live on the section, but
   * only `on` is public: a section reports its own intent, nothing above emits into it.
   */
  type Emitting = {
    emitter: _events.EventEmitter;
    emit(event: string, ...args: any[]): void;
  };

  namespace Option {
    /** A dialog as one row of the dialogs list, padded to the panel width. */
    function from(dialog: Dialog): _DialogOption;
    /** Everything `from` reads but the chat id, joined: an unchanged key means an unchanged row. */
    function key(dialog: Dialog): string;
  }

  // ── 6-ui/dialogs ──────────────────────────────────────────────────────────────────────
  type DialogsSection = Section & {
    list: _opentui.SelectRenderable;
    component: PanelRenderable;
    on(event: 'open', handler: (chatId: number) => void): void;
    /** Move the cursor, in rows. */
    moveDown(count?: number): void;
    moveUp(count?: number): void;
    first(): void;
    last(): void;
    /** Report the highlighted chat as the section's `open` intent. */
    open(): void;
    render(dialogs: Dialog[]): void;
    select(chatId: number): void;
    /** Widen (or, negative, narrow) the pane by `delta` cells within the screen's bounds; false when already at the limit. */
    resize(delta: number): boolean;
    /** Name the shown folder in the top border. */
    setFolder(title: string): void;
    /** Leave the top border without a folder name. */
    clearFolder(): void;
    /** The list stopped loading: stop the spinner, and say why when it failed. */
    settle(error?: unknown): void;
  };

  type DialogsSelf = DialogsSection &
    Emitting & {
      /** True until the dialog list settles, either loaded or failed. */
      loading: boolean;
      /** The bottom-border spinner, started as the section loads; `settle` stops it. */
      spinner: { stop(): void };
      /** The rows `render` last built, by chat id, each with the key it was built from. */
      rows: Map<number, { key: string; option: _DialogOption }>;
    };

  // ── 6-ui/(common) ─────────────────────────────────────────────────────────────────────
  namespace Sender {
    /** A stable colour per sender, for names in group bubbles, forward lines and quotes. */
    const color: (key: string) => string;
  }

  /** The two quoted lines, as `Quote.paint` draws them: `head` in `color` (bold, or italic for a
   * line standing in for a sender), `body` muted under it, or a bare bar when null. */
  type QuoteLines = { color: string; head: string; body: string | null; italic: boolean };

  /** A bar-led two-line quote: of what a message answers, in its bubble and in the message box. */
  namespace Quote {
    const from: (replyTo: Omit<NonNullable<Message['replyTo']>, 'id'>) => QuoteLines;
    /** Each line ellipsized to `cells`, bar included. */
    const paint: (lines: QuoteLines, cells: number) => _opentui.StyledText;
  }

  /** Message text drawn with its formatting: overlapping spans combine, links carry their URL. */
  namespace Entities {
    const paint: (text: string, entities: Entity[]) => _opentui.StyledText;
  }

  // ── 6-ui/chat ─────────────────────────────────────────────────────────────────────────
  /** A message drawn as a bordered box: album counter, picture and media label above the text. */
  namespace Bubble {
    /** Build a message's bubble, painted. Its picture exists only when some medium is drawable. */
    const create: (message: ChatMessage) => BubbleView;
    /** Redraw every node from `view.message` and `view.mediumIndex`; the other Bubble functions call it. */
    const paint: (view: BubbleView) => void;
    /** Draw a new copy of the message: an edit, or a thumbnail that finished downloading. */
    const update: (view: BubbleView, message: ChatMessage) => void;
    /** Flip an album by `step` media, wrapping around. No-op with fewer than two. */
    const flipAlbum: (view: BubbleView, step: number) => void;
    /** Bubble size in cells, or null when the medium has no drawable image. */
    const size: (media: ImageMedia) => { cols: number; rows: number } | null;
    /** The size of the first drawable medium among `media`, shared by every picture in the album. */
    const albumSize: (media: _Media[]) => { cols: number; rows: number } | null;
  }
  /** The row of reactions under a bubble's text. */
  namespace Reactions {
    /** One line, `👍 3  ❤ 1  +2`: ours highlighted, the first few shown and the rest counted. */
    const paint: (reactions: Message['reactions']) => _opentui.StyledText;
    /** A count as the row shows it: shortened past three digits (1.2K, 12K, 3.4M). */
    const count: (count: number) => string;
  }

  /** An empty thumbnail slot of `size` cells; `Bubble.paint` sets the source of the part on screen. */
  const Picture: (
    protocol: _opentui.ImageRenderProtocol,
    size: { cols: number; rows: number },
  ) => _opentui.ImageRenderable;

  /** One bubble, its nodes and what they draw. Only the Bubble functions write to it. */
  type BubbleView = {
    box: _opentui.BoxRenderable;
    /** The two-line quote of what the message answers; hidden when it answers nothing. */
    reply: _opentui.TextRenderable;
    /** The album's `‹ 2/4 ›`; hidden for a lone message. */
    counter: _opentui.TextRenderable;
    /** Null when no part was drawable when the bubble was built, or images are off. */
    picture: _opentui.ImageRenderable | null;
    /** The current part's media label; hidden when its picture says it all. */
    label: _opentui.TextRenderable;
    /** The message's text; hidden when empty. */
    text: _opentui.TextRenderable;
    /** One line of reactions under the text; hidden when there are none. */
    reactions: _opentui.TextRenderable;
    /** The message this bubble draws, thumbnails included. */
    message: ChatMessage;
    /** Index into `message.media` of the medium on screen. */
    mediumIndex: number;
  };

  type ChatSection = Section & {
    /** The bordered pane around the messages. Its top border carries the label and the open chat's
     * name on the left and the partner's presence on the right; its bottom border the status, the
     * selected message's date and the receipt. */
    component: PanelRenderable;
    /** The messages alone — everything the cursor and the scroll position are about. */
    scroll: _opentui.ScrollBoxRenderable;
    /** Derived, recomputed on every read: the message at the cursor, `null` when the chat is empty. */
    readonly selectedMessage: ChatMessage | null;
    on(event: 'reachTop', handler: () => void): void;
    /** Move the cursor, in messages. */
    down(count?: number): void;
    up(count?: number): void;
    /** Scroll the selected message's text inside its bubble, in lines. No-op when the bubble fits. */
    scrollMessage(lines: number): void;
    /** The oldest message loaded so far, which also asks for more history. */
    first(): void;
    /** Start over on another chat: drop the last chat's bubbles, forget the cursor and clear the
     * status. Its bubbles and border come with the repaints of the freshly opened store. */
    open(): void;
    /** Make the bubbles match the open chat: one per message, in order, reusing each bubble whose
     * id is still held. */
    render(messages: readonly ChatMessage[]): void;
    /** Put the chat's glyph and name on the top border. */
    paintName(chatId: number, name: string): void;
    /** Draw whether our last message was read on the bottom border; blank for null. */
    paintReceipt(receipt: Receipt | null): void;
    /** Draw the partner's online/last-seen state on the top border; blank for null. */
    paintPresence(presence: Presence | null): void;
    selectLast(): void;
    /** Show `status` at the bottom border's left until `clearStatus`. */
    setStatus(status: string): void;
    clearStatus(): void;
    /** Show a transient word over the status for `ms`; the status comes back after. */
    flashStatus(status: string, ms?: number): void;
    /** Spin over the status while the open chat loads, after a short delay, until the returned
     * spinner is stopped. Opening another chat stops it too. */
    spin(): { stop(): void };
    /** Flip the selected album by `step` media, wrapping around. No-op with fewer than two. */
    flipSelectedAlbum(step: number): void;
    /** Derived, recomputed on every read: the medium on screen in the selected message. */
    readonly selectedMedium: _Media | null;
  };

  type ChatSelf = ChatSection &
    Emitting & {
      /** True only while the chat is the selected section — gates whether the cursor takes opentui focus. */
      focused: boolean;
      /** The bubbles in display order, by message id, as `render` last left them. */
      views: _KeyedList<BubbleView, number>;
      /** Day key (see `Day.key`) to the separator drawn above that day's earliest bubble. */
      days: Map<string, _opentui.TextRenderable>;
      /** The message under the cursor, by id, so the cursor survives messages landing above it;
       * `null` when nothing is selected. */
      selectedMessageId: number | null;
      /** The spinner `spin` last started; stopping it again is a no-op. */
      spinner: { stop(): void };
      /** Derived, recomputed on every read: the cursor's position in `views`, -1 when unset. */
      readonly selectedIndex: number;
      /** Give every day one separator, right above its earliest bubble, and drop the rest. */
      redate(): void;
      /** Put the cursor on the bubble at `index`, clamped, and bring it into view. */
      selectAt(index: number): void;
      /** Draw the selected message's day and time on the bottom border; blank with no selection. */
      paintDate(): void;
      /** Derived, recomputed on every read: the TextRenderable under the cursor — the bubble's
       * scroll window — or `null` when the chat is empty. */
      readonly selectedText: _opentui.TextRenderable | null;
    };

  // ── 6-ui/messagePrompt ────────────────────────────────────────────────────────────────
  type MessagePromptSection = Section & {
    component: _opentui.BoxRenderable;
    input: _opentui.TextareaRenderable;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
    /** Report the typed text as the `send` (with the message it replies to, if any) or, while
     * editing, `edit` intent, and empty the box. */
    send(): void;
    /** Stash the current draft, seed the box with a message's text, and enter edit mode. */
    edit(messageId: number, text: string): void;
    /** Enter reply mode for `messageId`, keeping the draft; `quote` is drawn above the input. */
    reply(messageId: number, quote: Omit<NonNullable<Message['replyTo']>, 'id'>): void;
    /** Leave reply mode, returning the id it replied to, or null outside it. */
    takeReply(): number | null;
    /** Leave edit and reply mode, as when another chat opens. */
    reset(): void;
    /** Leave reply mode, else edit mode, else the box. */
    exit(): void;
  };

  type MessagePromptSelf = MessagePromptSection &
    Emitting & {
      /** The message id being edited, or `null` outside edit mode. */
      editing: number | null;
      /** The message id the next send answers, or `null` outside reply mode. */
      replyingTo: number | null;
      /** The draft that was in the box before `edit` was called, restored when the edit is cancelled. */
      draft: string;
      /** Leave edit mode and restore the draft, without reporting any intent. */
      clearEdit(): void;
      /** The line over the input: the message being answered or edited; `null` hides it. */
      quote: _opentui.TextRenderable;
      /** The border-joined line between the quote and the input, shown with the quote. */
      rule: _opentui.TextRenderable;
      /** What `quote` draws, kept to redraw it at a new width. */
      quoted: QuoteLines | null;
      /** Draw `quoted` at the box's current width, or hide the quote. */
      paintQuote(): void;
      /** Show `quoted` over the input, or hide it with `null`. */
      setQuote(quoted: QuoteLines | null): void;
    };

  // ── 6-ui/picker ───────────────────────────────────────────────────────────────────────
  type PickerSection = Section & {
    search: SearchListRenderable;
    component: _opentui.BoxRenderable;
    /** Serve `request` on the next focus: its title, placeholder and items, and what a pick means. */
    open<T>(request: PickerRequest<T>): void;
    on(event: 'close', handler: () => void): void;
    moveDown(): void;
    moveUp(): void;
    pageDown(): void;
    pageUp(): void;
    first(): void;
    last(): void;
    /** Hand the highlighted result to the open request. */
    pick(): void;
    /** What the hint bar calls a pick: the open request's `pickHint`, else 'Open'. */
    readonly pickHint: string;
    close(): void;
  };

  /** One row to search: `value` is what `onPick` receives. */
  type PickerItem<T = unknown> = { name: string; description: string; value: T };

  /** One use of the picker. The items are a snapshot taken at open — never a source of truth. */
  type PickerRequest<T = unknown> = {
    title: string;
    placeholder: string;
    items: PickerItem<T>[];
    /** What the hint bar calls a pick; 'Open' when omitted. */
    pickHint?: string;
    onPick(value: T): void;
  };

  type PickerSelf = PickerSection & Emitting & { request: PickerRequest<any> | null };

  // ── 6-ui/choice ───────────────────────────────────────────────────────────────────────
  /** A few options to read and pick between, with no query: the picker without its search. */
  type ChoiceSection = Section & {
    list: _opentui.SelectRenderable;
    message: _opentui.TextRenderable;
    body: _opentui.TextRenderable;
    component: _opentui.BoxRenderable;
    /** Serve `request` on the next focus. */
    open<T>(request: ChoiceRequest<T>): void;
    on(event: 'close', handler: () => void): void;
    moveDown(): void;
    moveUp(): void;
    /** Hand the highlighted option to the open request. */
    pick(): void;
    /** What the hint bar calls a pick: the open request's `pickHint`, else 'Choose'. */
    readonly pickHint: string;
    close(): void;
  };

  /** One use of the choice dialog. `message` is the line above the options, left out when empty;
   * `body` is wrapped text under it, for what the line can't hold. */
  type ChoiceRequest<T = unknown> = {
    title: string;
    message: string;
    body?: string | _opentui.StyledText;
    options: { name: string; value: T }[];
    /** What the hint bar calls a pick; 'Choose' when omitted. */
    pickHint?: string;
    onPick(value: T): void;
  };

  type ChoiceSelf = ChoiceSection & Emitting & { choosing: ChoiceRequest<any> | null };

  // ── 6-ui/filePicker ───────────────────────────────────────────────────────────────────
  type FilePickerSection = Section & {
    list: FilePickerRenderable;
    component: _opentui.BoxRenderable;
    on(event: 'select', handler: (filePath: string) => void): void;
    on(event: 'cancel', handler: () => void): void;
    on(event: 'mode', handler: () => void): void;
    on(event: 'error', handler: (error: unknown) => void): void;
    /** Whether the live filter is being edited right now, as opposed to merely applied. */
    readonly filtering: boolean;
    moveUp(): void;
    moveDown(): void;
    first(): void;
    last(): void;
    /** Open the highlighted folder, or report the highlighted file as the `select` intent. */
    open(): void;
    goUp(): void;
    /** Clear an applied filter, or — with none applied — go up a folder. */
    backspace(): void;
    /** Enter filter mode, keeping any already-applied filter text so it can be refined. */
    startFilter(): void;
    /** Leave filter mode, keeping the filter text applied so the narrowing stays. */
    acceptFilter(): void;
    cancel(): void;
  };

  type FilePickerSelf = FilePickerSection & Emitting;

  /**
   * `on` is declared as overloads on the sections so callers get per-event handler types;
   * an overloaded member cannot be indexed with `['on']`, so the implementations type
   * themselves against these instead.
   */
  type FilePickerOnImpl = (event: 'select' | 'cancel' | 'mode' | 'error', handler: (...args: any[]) => void) => void;
  type MessagePromptOnImpl = (event: keyof MessagePromptEventMap, handler: (...args: any[]) => void) => void;

  // ── 6-ui/hints ────────────────────────────────────────────────────────────────────────
  /**
   * The bar under everything. Not a `Section` and not a `SectionName`: nothing focuses it, it
   * only reports what the focused section can do.
   */
  type HintsSection = {
    component: _opentui.BoxRenderable;
    /** Draw the hints that fit, left to right, and mark it when some had to be dropped. */
    render(hints: Hint[]): void;
  };

  type HintsSelf = HintsSection & { text: _opentui.TextRenderable };

  // ── 6-ui/errors ───────────────────────────────────────────────────────────────────────
  /**
   * The one error toast, bottom-right. Not a `Section` and not a `SectionName`: nothing focuses
   * it, it only reacts to `ui.errors.report` and the `app.errors` command.
   */
  type ErrorsSection = {
    component: _opentui.BoxRenderable;
    /** Log `error` and show `notice` in a toast, replacing whatever toast is already showing. */
    report(notice: string, error: unknown): void;
    /** `app.errors`'s handler: reveal the toast's detail line, then dismiss on the next press. */
    advance(): void;
  };

  type ErrorsSelf = ErrorsSection & {
    notice: _opentui.TextRenderable;
    /** The one-line technical summary, shown once the toast is expanded. */
    detail: _opentui.TextRenderable;
    /** Whether the detail line is showing — while true, the toast does not auto-dismiss. */
    expanded: boolean;
    /** Auto-dismiss timer; cleared while expanded so nothing vanishes mid-read. */
    timer: NodeJS.Timeout | undefined;
    /** Sync the detail line's visibility and the bottom-title hint to `expanded`. */
    paint(): void;
    /** Clear the timer, collapse, and hide the toast. */
    dismiss(): void;
  };

  // ── 6-ui/updateNotification ──────────────────────────────────────────────────────────
  /**
   * The row above the hint bar. Not a `Section` and not a `SectionName`: nothing focuses it,
   * it only reflects `store.update.available`.
   */
  type UpdateSection = {
    component: _opentui.BoxRenderable;
    /** Draw the notice for `release`. */
    display(release: UpdateRelease): void;
    /** Hide the row — there is nothing to show, or the notice was dismissed. */
    hide(): void;
  };

  type UpdateSelf = UpdateSection & { text: _opentui.TextRenderable };

  namespace ui {
    const dialogs: DialogsSection;
    const chat: ChatSection;
    const messagePrompt: MessagePromptSection;
    const picker: PickerSection;
    const choice: ChoiceSection;
    const filePicker: FilePickerSection;
    const hints: HintsSection;
    const errors: ErrorsSection;
    const updateNotification: UpdateSection;
  }
}

export {};
