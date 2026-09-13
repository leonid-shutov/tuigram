import * as _opentui from '@opentui/core';
import * as _events from 'node:events';
import { Dialog, DialogOption as _DialogOption, ImageMedia } from './domain';

declare global {
  type DialogOption = _DialogOption;

  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
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
    /** Chat ids of the rows currently drawn, in row order — `select` maps a chat id to a row. */
    chatIds: number[];
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
  const Bubble: (message: ChatMessage, picture: _opentui.ImageRenderable | null) => _opentui.BoxRenderable;
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
    selectLast(): void;
    /** Fill the header line with the open chat's glyph and name. */
    setHeader(chatId: number, name: string): void;
    setReceipt(receipt: Receipt | null): void;
    /** Transient word in the receipt's corner. `actions.repaintReceipt()` puts the receipt back. */
    setStatus(status: string | null): void;
    setThumb(messageId: number, bytes: Uint8Array): void;
  };

  type ChatSelf = ChatSection &
    Emitting & {
      /** True only while the chat is the selected section — gates whether the cursor takes opentui focus. */
      focused: boolean;
      /** Message id to the bubble drawing it and the image inside — the section's only id-keyed view state. */
      bubbles: Map<number, { bubble: _opentui.BoxRenderable; picture: _opentui.ImageRenderable | null }>;
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
    /** Report the typed text as the `send` intent and empty the box. */
    send(): void;
    exit(): void;
  };

  type MessagePromptSelf = MessagePromptSection & Emitting;

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

  /**
   * `on` is declared as overloads on the sections so callers get per-event handler types;
   * an overloaded member cannot be indexed with `['on']`, so the implementations type
   * themselves against these instead.
   */
  type PickerOnImpl = (event: 'pick' | 'close', handler: (...args: any[]) => void) => void;
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

  namespace ui {
    const dialogs: DialogsSection;
    const chat: ChatSection;
    const messagePrompt: MessagePromptSection;
    const picker: PickerSection;
    const hints: HintsSection;
  }
}

export {};
