import * as _opentui from '@opentui/core';
import * as _events from 'node:events';
import { Dialog, DialogOption as _DialogOption, ImageMedia } from './domain';

declare global {
  type DialogOption = _DialogOption;

  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
    size: { width: number; height: number; dialogsWidth: number };
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
  }

  // ── 6-ui/dialogs ──────────────────────────────────────────────────────────────────────
  type DialogsSection = Section & {
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
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
    /** The list stopped loading: stop the spinner, and say why when it failed. */
    settle(error?: unknown): void;
  };

  type DialogsSelf = DialogsSection &
    Emitting & {
      /** True until the dialog list settles, either loaded or failed. */
      loading: boolean;
      /** The interval driving the bottom-border spinner, cleared by `settle`. */
      spinner: NodeJS.Timeout;
    };

  // ── 6-ui/chat ─────────────────────────────────────────────────────────────────────────
  /** A message drawn as a bordered box, with its picture — when it has one — above the text. */
  const Bubble: (
    message: ChatMessage,
    picture: _opentui.ImageRenderable | null,
    text: _opentui.TextRenderable | null,
  ) => _opentui.BoxRenderable;
  /** A medium's thumbnail, or null when the sender omitted the dimensions to size it from. */
  const Picture: (media: ImageMedia, protocol: _opentui.ImageRenderProtocol) => _opentui.ImageRenderable | null;

  type ChatSection = Section & {
    /** The bordered pane: the header, then the messages. Carries both border titles. */
    component: _opentui.BoxRenderable;
    /** The open chat's name, pinned under the top border and outside the scrolling content. */
    header: _opentui.TextRenderable;
    /** The messages alone — everything the cursor and the scroll position are about. */
    scroll: _opentui.ScrollBoxRenderable;
    /** Cursor position among the ScrollBox's children; -1 when the chat is empty. */
    selectedIndex: number;
    /** Derived, recomputed on every read: the message at the cursor, `null` when the chat is empty. */
    readonly selectedMessage: ChatMessage | null;
    on(event: 'reachTop', handler: () => void): void;
    /** Move the cursor, in messages. */
    down(count?: number): void;
    up(count?: number): void;
    /** The oldest message loaded so far, which also asks for more history. */
    first(): void;
    append(message: ChatMessage): void;
    clear(): void;
    /** A pending message got its real id: re-key its bubble from the temp id. */
    confirm(tempId: number, messageId: number): void;
    /** Remove a message's bubble and unfile it, cursor included. */
    drop(messageId: number): void;
    prepend(older: ChatMessage[]): void;
    /** Swap a held message's bubble text for its edited copy, in place. */
    replace(message: ChatMessage): void;
    selectLast(): void;
    /** Fill the header line with the open chat's glyph and name. */
    setHeader(chatId: number, name: string): void;
    setReceipt(receipt: Receipt | null): void;
    /** Replace the bottom title; stays until the next explicit change. */
    setStatus(status: string): void;
    /** Show a transient word in the receipt's corner, then restore the receipt after `ms`. */
    flashStatus(status: string, ms?: number): void;
    setThumb(messageId: number, bytes: Uint8Array): void;
  };

  type ChatSelf = ChatSection &
    Emitting & {
      /** True only while the chat is the selected section — gates whether the cursor takes opentui focus. */
      focused: boolean;
      /** Message id to the bubble drawing it and the image/text inside — the section's only id-keyed view state. */
      bubbles: Map<
        number,
        {
          bubble: _opentui.BoxRenderable;
          picture: _opentui.ImageRenderable | null;
          text: _opentui.TextRenderable | null;
        }
      >;
      /** Build a message's bubble, place it, and file it under its id. Omit `index` to append. */
      insert(message: ChatMessage, index?: number): void;
      selectMessage(index: number): void;
      senderColor(key: string): string;
    };

  // ── 6-ui/messagePrompt ────────────────────────────────────────────────────────────────
  type MessagePromptSection = Section & {
    component: _opentui.BoxRenderable;
    input: _opentui.TextareaRenderable;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
    /** Report the typed text as the `send` (or, while editing, `edit`) intent and empty the box. */
    send(): void;
    /** Stash the current draft, seed the box with a message's text, and enter edit mode. */
    edit(messageId: number, text: string): void;
    exit(): void;
  };

  type MessagePromptSelf = MessagePromptSection &
    Emitting & {
      /** The message id being edited, or `null` outside edit mode. */
      editing: number | null;
      /** The draft that was in the box before `edit` was called, restored when the edit is cancelled. */
      draft: string;
      /** Leave edit mode and restore the draft, without reporting any intent. */
      clearEdit(): void;
    };

  // ── 6-ui/picker ───────────────────────────────────────────────────────────────────────
  type PickerSection = Section & {
    input: _opentui.TextareaRenderable;
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    /** Snapshot of the dialog list to filter against — a projection, never a source of truth. */
    items: Dialog[];
    on(event: 'pick', handler: (chatId: number) => void): void;
    on(event: 'close', handler: () => void): void;
    moveDown(): void;
    moveUp(): void;
    /** Report the highlighted result as the `pick` intent. */
    pick(): void;
    close(): void;
    setItems(dialogs: Dialog[]): void;
  };

  type PickerSelf = PickerSection & Emitting & { filter(query: string): void };

  // ── 6-ui/filePicker ───────────────────────────────────────────────────────────────────
  type FilePickerSection = Section & {
    list: import('@leonid-shutov/opentui-file-picker').FilePickerRenderable;
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
  type PickerOnImpl = (event: 'pick' | 'close', handler: (...args: any[]) => void) => void;
  type FilePickerOnImpl = (
    event: 'select' | 'cancel' | 'mode' | 'error',
    handler: (...args: any[]) => void,
  ) => void;
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
    const filePicker: FilePickerSection;
    const hints: HintsSection;
    const errors: ErrorsSection;
    const updateNotification: UpdateSection;
  }
}

export {};
