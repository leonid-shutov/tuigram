import * as _opentui from '@opentui/core';
import { TelegramClient } from '@mtcute/node';
import { Dispatcher } from '@mtcute/dispatcher';
import { Message, Dialog, DialogOption, PendingMessage, Media } from './domain';
import { LinkedList, LinkedListNode } from './collections';

declare global {
  type ScreenModule = {
    renderer: _opentui.CliRenderer;
    wrapper: _opentui.BoxRenderable;
  };

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
    qrLogin(onPhone: () => void): (url: string) => void;
  };

  type AuthUiSelf = AuthUiModule & {
    mount(props: { title: string; children: OpenTUIChildren }): AuthScreenHandle;
    ask(props: { label: string; hint: string; placeholder: string }): Promise<string>;
    askPassword(props: { label: string; hint: string }): Promise<string>;
  };

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

  type HistoryReadEvent = { chatId: number; isOutbox: boolean; maxReadId: number; unreadCount: number };

  type MessengerModule = {
    tg: TelegramClient;
    dispatcher: Dispatcher;
    getHistory(chatId: number, firstPageSize: number, pageSize?: number): AsyncGenerator<Message[]>;
    /** The 320px thumbnail behind a file id, or null if it could not be fetched. Cached. */
    downloadThumb(fileId: string): Promise<Uint8Array | null>;
    getReadOutboxMaxId(chatId: number): Promise<number>;
    iterDialogs(options?: { chunkSize?: number; archived?: boolean }): AsyncGenerator<Dialog>;
    onHistoryRead(handler: (event: HistoryReadEvent) => void): void;
    onNewMessage(handler: (message: Message) => void): void;
    readHistory(chatId: number): Promise<unknown>;
    sendMessage(chatId: number, text: string): Promise<Message>;
  };

  type PickerOnImpl = (event: 'pick' | 'close', handler: (...args: any[]) => void) => void;
  type MessagePromptOnImpl = (event: keyof MessagePromptEventMap, handler: (...args: any[]) => void) => void;

  // ── 6-ui/2-sections/1-dialogs ─────────────────────────────────────────────────────────
  /** A projection of `store.dialogs`: renderables, focus, keys. It owns no dialog data. */
  type DialogsSection = {
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    on(event: 'open', handler: (option: DialogOption) => void): void;
    select(chatId: number): void;
    setLabel(label: string): void;
  };

  type DialogsSelf = DialogsSection & { render(): void };

  // ── 6-ui/2-sections/2-chat ────────────────────────────────────────────────────────────
  /** A message in the open chat, once the section has attached its rendered bubble. */
  type ChatMessage = (Message | PendingMessage) & { bubble?: _opentui.BoxRenderable };

  type ChatSection = {
    component: _opentui.ScrollBoxRenderable;
    Bubble(message: ChatMessage): _opentui.BoxRenderable;
    Picture(media: Media | null): _opentui.ImageRenderable | null;
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
    confirmMessage(tempId: number, confirmedMessage: Message): void;
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
    scrollToBottom(): void;
  };

  // ── 6-ui/2-sections/3-messagePrompt ───────────────────────────────────────────────────
  type MessagePromptSection = {
    component: _opentui.BoxRenderable;
    input: _opentui.TextareaRenderable;
    events: import('node:events').EventEmitter<MessagePromptEventMap>;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    on<K extends keyof MessagePromptEventMap>(event: K, handler: (...args: MessagePromptEventMap[K]) => void): void;
    setLabel(label: string): void;
  };
  type MessagePromptSelf = MessagePromptSection;

  // ── 6-ui/2-sections/5-picker ──────────────────────────────────────────────────────────
  type PickerSection = {
    input: _opentui.TextareaRenderable;
    list: _opentui.SelectRenderable;
    component: _opentui.BoxRenderable;
    readonly capturing: boolean;
    blur(): void;
    focus(): void;
    key(event: _opentui.KeyEvent): void;
    on(event: 'pick', handler: (dialog: Dialog) => void): void;
    on(event: 'close', handler: () => void): void;
    setLabel(label: string): void;
  };

  type PickerSelf = PickerSection & {
    /** Snapshot of `store.dialogs.all()` taken when the picker opens. */
    dialogList: Dialog[];
    emitter: import('node:events').EventEmitter;
    emit(event: string, ...args: unknown[]): void;
    filter(query: string): void;
  };

  // ── 6-ui/3-layout ─────────────────────────────────────────────────────────────────────
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
    openedChatId: number | undefined;
    shortcuts: Record<string, { label: string; section: SectionName }>;
    sectionShortcuts: Partial<Record<SectionName, Record<string, SectionName>>>;
    cycle: SectionName[];
  };

  type LayoutSelf = LayoutModule & {
    cycleSection(step: 1 | -1): void;
    openChat(dialog: Pick<Dialog, 'chatId'>): void;
    notifyMessage(message: Message): void;
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
      const picker: PickerSection;
    }
  }

  /**
   * Members whose type differs between modules, so the intersection below would be unusable
   * (an intersection of two unrelated types cannot be assigned either one).
   */
  type SelfConflicts = 'component' | 'focus' | 'key' | 'capturing';

  type AppSelf = Omit<
    ScreenModule &
      AuthSelf &
      AuthUiSelf &
      MessengerModule &
      DialogsSelf &
      ChatSelf &
      MessagePromptSelf &
      PickerSelf &
      LayoutSelf &
      DialogsStoreSelf,
    SelfConflicts
  > &
    Record<SelfConflicts, any>;

  const self: AppSelf;
}

export {};
