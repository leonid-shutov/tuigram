import * as _opentui from '@opentui/core';
import { Dialog, DialogOption as _DialogOption, Media } from './domain';

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

  namespace Option {
    /** A dialog as one row of the dialogs list, padded to the panel width. */
    function from(dialog: Dialog): _DialogOption;
  }

  // ── 6-ui/dialogs ──────────────────────────────────────────────────────────────────────
  type DialogsSection = Section & {
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    events: EmitterHandle;
    /** Chat ids of the rows currently drawn, in row order — `select` maps a chat id to a row. */
    chatIds: number[];
    on(event: 'open', handler: (chatId: number) => void): void;
    render(dialogs: Dialog[]): void;
    select(chatId: number): void;
  };

  // ── 6-ui/chat ─────────────────────────────────────────────────────────────────────────
  /** The async capabilities the chat view is handed at startup; see (public)/connect.js. */
  type ChatDeps = {
    loadOlder: () => Promise<void>;
    loadThumb: (fileId: string) => Promise<Uint8Array | null>;
  };

  type ChatSection = Section &
    ChatDeps & {
      component: _opentui.ScrollBoxRenderable;
      Bubble(message: ChatMessage): _opentui.BoxRenderable;
      Picture(media: Media | null): _opentui.ImageRenderable | null;
      /** Message id to the bubble drawing it — all `confirm` needs. */
      bubbles: Map<number, _opentui.BoxRenderable>;
      /** Cursor position among the ScrollBox's children; -1 when the chat is empty. */
      selectedIndex: number;
      append(message: ChatMessage): void;
      clear(): void;
      confirm(tempId: number, messageId: number): void;
      connect(deps: ChatDeps): void;
      prepend(older: ChatMessage[]): void;
      selectLast(): void;
      setReceipt(receipt: Receipt | null): void;
    };

  type ChatSelf = ChatSection & {
    down(): void;
    selectMessage(index: number): void;
    senderColor(key: string): string;
    up(): Promise<void>;
  };

  // ── 6-ui/messagePrompt ────────────────────────────────────────────────────────────────
  type MessagePromptSection = Section & {
    component: _opentui.BoxRenderable;
    input: _opentui.TextareaRenderable;
    events: EmitterHandle;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
  };

  // ── 6-ui/picker ───────────────────────────────────────────────────────────────────────
  type PickerSection = Section & {
    input: _opentui.TextareaRenderable;
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    events: EmitterHandle;
    /** Snapshot of the dialog list to filter against — a projection, never a source of truth. */
    items: Dialog[];
    on(event: 'pick', handler: (chatId: number) => void): void;
    on(event: 'close', handler: () => void): void;
    setItems(dialogs: Dialog[]): void;
  };

  type PickerSelf = PickerSection & { filter(query: string): void };

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
