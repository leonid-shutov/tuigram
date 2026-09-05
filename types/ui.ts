import * as _opentui from '@opentui/core';
import * as _events from 'node:events';
import { Dialog, DialogOption as _DialogOption, ImageMedia } from './domain';

declare global {
  type DialogOption = _DialogOption;

  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
  };

  /** Everything the navigation module needs from a section, and all it is allowed to use. */
  type Section = {
    readonly capturing: boolean;
    focus(): void;
    blur?(): void;
    key(event: _opentui.KeyEvent): void;
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
    render(dialogs: Dialog[]): void;
    select(chatId: number): void;
  };

  type DialogsSelf = DialogsSection & Emitting;

  // ── 6-ui/chat ─────────────────────────────────────────────────────────────────────────
  /** A message drawn as a bordered box, with its picture — when it has one — above the text. */
  const Bubble: (message: ChatMessage, picture: _opentui.ImageRenderable | null) => _opentui.BoxRenderable;
  /** A medium's thumbnail, or null when the sender omitted the dimensions to size it from. */
  const Picture: (media: ImageMedia, protocol: _opentui.ImageRenderProtocol) => _opentui.ImageRenderable | null;

  type ChatSection = Section & {
    component: _opentui.ScrollBoxRenderable;
    /** Message id to the bubble drawing it — all `confirm` needs. */
    bubbles: Map<number, _opentui.BoxRenderable>;
    /** Message id to the image its bubble draws — all `setThumb` needs. */
    pictures: Map<number, _opentui.ImageRenderable>;
    /** Cursor position among the ScrollBox's children; -1 when the chat is empty. */
    selectedIndex: number;
    on(event: 'reachTop', handler: () => void): void;
    append(message: ChatMessage): void;
    clear(): void;
    confirm(tempId: number, messageId: number): void;
    prepend(older: ChatMessage[]): void;
    selectLast(): void;
    setReceipt(receipt: Receipt | null): void;
    setThumb(messageId: number, bytes: Uint8Array): void;
  };

  type ChatSelf = ChatSection &
    Emitting & {
      down(): void;
      /** Build a message's bubble, place it, and file both maps. Omit `index` to append. */
      insert(message: ChatMessage, index?: number): void;
      selectMessage(index: number): void;
      senderColor(key: string): string;
      up(): void;
    };

  // ── 6-ui/messagePrompt ────────────────────────────────────────────────────────────────
  type MessagePromptSection = Section & {
    component: _opentui.BoxRenderable;
    input: _opentui.TextareaRenderable;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
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

  namespace ui {
    const dialogs: DialogsSection;
    const chat: ChatSection;
    const messagePrompt: MessagePromptSection;
    const picker: PickerSection;
  }
}

export {};
