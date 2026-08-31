// Shapes of the application's own modules — the directories under `src/` that the
// uncommonjs loader turns into objects on the sandbox.
//
// Each module gets two types: a `*Module`/`*Section` type describing what the rest of the app
// can reach (what the loader puts on the container), and a `*Self` type adding the members
// only that module sees — its `(private)/` files and any state its own files assign.
//
// `self` is declared once, globally, as the intersection of every `*Self`. That is a
// deliberate simplification: at runtime `self` is per-module, but ambient declarations cannot
// be scoped to a directory the way the loader is, and TypeScript gives every non-module .js
// file one shared global scope (see TYPING_GOTCHAS.md). The intersection means `self.x` is
// typed, but nothing stops one module from naming another's member. Members whose type
// genuinely differs between modules are listed in `SelfConflicts` and fall back to `any`.

import * as _opentui from '@opentui/core';
import { NeovimClient } from 'neovim';
import { Message as MtCuteMessage, TelegramClient } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import { Message, Dialog, UiDialog, PendingMessage, LinkedDialogsHandle } from './domain';
import { LinkedList, LinkedListNode } from './collections';

declare global {
  // ── 2-screen ──────────────────────────────────────────────────────────────────────────
  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
  };
  type ScreenSelf = ScreenModule;

  // ── 3-auth/ui ─────────────────────────────────────────────────────────────────────────
  /** What `mount` hands back: the screen currently on the wrapper, and how to take it down. */
  type AuthScreenHandle = {
    onKey(handler: (event: _opentui.KeyEvent) => void): void;
    render(): void;
    dispose(): void;
  };

  type AuthUiModule = {
    current: AuthScreenHandle | null;
    dispose(): void;
    credentialsForm(): Promise<{ apiId: string; apiHash: string }>;
    passwordPrompt(invalid: boolean): Promise<string>;
    phoneCode(options: { invalid: boolean; sentVia: string | null }): Promise<string>;
    phoneNumber(): Promise<string>;
    /** Returns mtcute's qrCodeHandler: called with a fresh login URL on every refresh. */
    qrLogin(onPhone: () => void): (url: string) => void;
  };

  type AuthUiSelf = AuthUiModule & {
    mount(props: { title: string; children: OpenTUIChildren }): AuthScreenHandle;
    ask(props: { label: string; hint: string; placeholder: string }): Promise<string>;
    askPassword(props: { label: string; hint: string }): Promise<string>;
  };

  // ── 3-auth ────────────────────────────────────────────────────────────────────────────
  type AuthModule = {
    client: TelegramClient;
    ui: AuthUiModule;
  };

  type AuthSelf = Omit<AuthModule, 'ui'> & {
    ui: AuthUiSelf;
    exit(message: string, code: number): never | void;
    fail(error: unknown): void;
    secureSession(): void;
  };

  // ── 4-messenger ───────────────────────────────────────────────────────────────────────
  type HistoryReadEvent = { chatId: number; isOutbox: boolean; maxReadId: number; unreadCount: number };

  type MessengerModule = {
    tg: TelegramClient;
    dispatcher: Dispatcher;
    /** Yields pages of messages, newest first, walking backwards through the chat. */
    getHistory(chatId: number, firstPageSize: number, pageSize?: number): AsyncGenerator<Message[]>;
    getReadOutboxMaxId(chatId: number): Promise<number>;
    iterDialogs(options?: { chunkSize?: number; archived?: boolean }): AsyncGenerator<Dialog>;
    on(event: 'message', handler: (message: Message) => void): void;
    on(event: 'historyRead', handler: (event: HistoryReadEvent) => void): void;
    readHistory(chatId: number): Promise<unknown>;
    sendMessage(chatId: number, text: string): Promise<MtCuteMessage>;
  };
  type MessengerSelf = MessengerModule;

  /**
   * An `on` implementation dispatches on the event name, so it sees every payload type at
   * once and cannot be written against the caller-facing overloads. These aliases type the
   * dispatcher files; the overloads above stay precise for everyone calling them.
   */
  type MessengerOnImpl = (event: 'message' | 'historyRead', handler: (payload: any) => void) => void;
  type PickerOnImpl = (event: 'pick' | 'close', handler: (...args: any[]) => void) => void;
  type MessagePromptOnImpl = (event: keyof MessagePromptEventMap, handler: (...args: any[]) => void) => void;

  // ── 5-ui/2-sections/1-dialogs ─────────────────────────────────────────────────────────
  type DialogsSection = {
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    dialogs: LinkedDialogsHandle;
    /** Chat ids in the archive folder; set once the archived dialogs finish loading. */
    archived?: Set<number>;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    getAll(): UiDialog[];
    isArchived(chatId: number): boolean;
    isMuted(chatId: number): boolean;
    key(event: _opentui.KeyEvent): void;
    markRead(chatId: number): void;
    on(event: 'open', handler: (dialog: UiDialog) => void): void;
    onMessage(message: DialogUpdate): void;
    select(chatId: number): void;
    setArchived(dialogs: Dialog[]): void;
    setDialogs(dialogs: Dialog[]): void;
    setLabel(label: string): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  /**
   * What the dialogs list needs off an incoming message. A real `Message` qualifies; so does
   * the stand-in the layout builds when *we* send a message, which has no media.
   */
  type DialogUpdate = Pick<Message, 'chatId' | 'text'> & {
    chatName?: string;
    media?: Message['media'];
    sender: { isSelf: boolean };
  };

  type DialogsSelf = DialogsSection & { render(): void };

  /** The dialogs list's element type and its list node, for the files that build it. */
  type UiDialogValue = UiDialog;
  type UiDialogNode = LinkedListNode<UiDialog>;

  // ── 5-ui/2-sections/2-chat ────────────────────────────────────────────────────────────
  /** A message in the open chat, once the section has attached its rendered bubble. */
  type ChatMessage = (Message | PendingMessage) & { bubble?: _opentui.BoxRenderable };

  type ChatSection = {
    component: _opentui.ScrollBoxRenderable;
    Bubble(message: ChatMessage): _opentui.BoxRenderable;
    messages: LinkedList<ChatMessage>;
    selectedMessage: LinkedListNode<ChatMessage> | null;
    readUpTo: number;
    /** The open chat's history pager; undefined until a chat is opened. */
    iterator?: AsyncGenerator<ChatMessage[]>;
    loadingMore?: boolean;
    readonly capturing: boolean;
    addMessage(message: ChatMessage): void;
    addPendingMessage(text: string): number;
    blur(): void;
    confirmMessage(tempId: number, confirmedMessage: { id: number }): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    open(chatId: number): Promise<void>;
    setLabel(label: string): void;
    setReadUpTo(maxReadId: number): void;
  };

  type ChatSelf = ChatSection & {
    clear(): void;
    down(): void;
    loadMore(): Promise<void>;
    renderReceipt(): void;
    selectMessage(message: LinkedListNode<ChatMessage> | null): void;
    senderColor(key: string): string;
    up(): Promise<void>;
  };

  // ── 5-ui/2-sections/3-messagePrompt ───────────────────────────────────────────────────
  /** Both editors answer the same calls; the prompt does not care which one is loaded. */
  type Editor = {
    readonly capturing: boolean;
    key(event: _opentui.KeyEvent): void;
    focus?(): void;
  };

  type MessagePromptSection = {
    component: _opentui.BoxRenderable;
    editor: Editor;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
    setLabel(label: string): void;
  };
  type MessagePromptSelf = MessagePromptSection & { nvimEditor: Editor; plainEditor: Editor };

  type NvimEditorSelf = Editor & {
    nvim: NeovimClient;
    /** Neovim's current mode, normalised to a word; undefined until the first ModeChanged. */
    mode?: string;
    keycodes: Record<string, string>;
    clear(): Promise<void>;
    feed(event: _opentui.KeyEvent): Promise<unknown>;
    send(): void;
    setMode(raw: string): void;
    syncCursor(): Promise<void>;
    syncText(): Promise<void>;
    toggleTranslit(): void;
    focus(): void;
  };

  type PlainEditorSelf = Editor & {
    clear(): void;
    exit(): void;
    send(): void;
    type(event: _opentui.KeyEvent): void;
  };

  // ── 5-ui/2-sections/4-status ──────────────────────────────────────────────────────────
  type StatusSection = {
    component: _opentui.BoxRenderable;
    mode: _opentui.TextRenderable;
    translit: _opentui.TextRenderable;
  };
  type StatusSelf = StatusSection;

  // ── 5-ui/2-sections/5-picker ──────────────────────────────────────────────────────────
  type PickerSection = {
    input: _opentui.TextareaRenderable;
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    on(event: 'pick', handler: (dialog: UiDialog) => void): void;
    on(event: 'close', handler: () => void): void;
    setLabel(label: string): void;
  };

  type PickerSelf = PickerSection & {
    /** Snapshot of the dialogs list taken when the picker opens. */
    dialogList: UiDialog[];
    emitter: import('node:events').EventEmitter;
    emit(event: string, ...args: unknown[]): void;
    filter(query: string): void;
  };

  // ── 5-ui/3-layout ─────────────────────────────────────────────────────────────────────
  type SectionName = 'dialogs' | 'chat' | 'messagePrompt' | 'picker';

  /** Every section the layout can hand focus and keys to. */
  type Section = {
    readonly capturing: boolean;
    focus(): void;
    blur?(): void;
    key(event: _opentui.KeyEvent): void;
    setLabel(label: string): void;
  };

  type LayoutModule = {
    selected: SectionName;
    /** The chat currently shown in the chat pane; undefined until one is opened. */
    openedChatId: number | undefined;
    shortcuts: Record<string, { label: string; section: SectionName }>;
  };

  type LayoutSelf = LayoutModule & {
    openChat(dialog: Pick<UiDialog, 'chatId'>): void;
    select(section: SectionName): void;
  };

  // ── the sandbox ───────────────────────────────────────────────────────────────────────
  const screen: ScreenModule;
  const auth: AuthModule;
  const messenger: MessengerModule;

  namespace ui {
    const layout: LayoutModule;
    namespace sections {
      const dialogs: DialogsSection;
      const chat: ChatSection;
      const messagePrompt: MessagePromptSection;
      const status: StatusSection;
      const picker: PickerSection;
    }
  }

  /**
   * Members whose type differs between modules, so the intersection below would be unusable
   * (an intersection of two unrelated types cannot be assigned either one).
   */
  type SelfConflicts = 'component' | 'clear' | 'send' | 'focus' | 'key' | 'capturing' | 'exit' | 'mode';

  type AppSelf = Omit<
    ScreenSelf &
      AuthSelf &
      AuthUiSelf &
      MessengerSelf &
      DialogsSelf &
      ChatSelf &
      MessagePromptSelf &
      NvimEditorSelf &
      PlainEditorSelf &
      StatusSelf &
      PickerSelf &
      LayoutSelf,
    SelfConflicts
  > &
    Record<SelfConflicts, any>;

  const self: AppSelf;
}

export {};
