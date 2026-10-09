import { Dialog, Folder, Message, PendingMessage, LinkedDialogsHandle, Presence } from './domain';

declare global {
  /** A message held in the open chat's window — ours before the server confirms it, or theirs. */
  type ChatMessage = Message | PendingMessage;

  /** Whether the chat advertises a receipt on our own last message, and which one. */
  type Receipt = 'read' | 'unread';

  /**
   * A store's change event: every mutator emits `change` once it returns, by way of `Mutation`,
   * so `on('change')` hears about every change made through the store.
   */
  type StoreEvents = {
    emitter: import('node:events').EventEmitter;
    emit(event: 'change'): void;
    on(event: 'change', handler: () => void): void;
  };

  /**
   * Wrap a store mutator so the store emits `change` once it returns: synchronously, so a
   * listener sees the new state before the caller's next line, and not at all if it throws.
   */
  const Mutation: <F extends (...args: any[]) => unknown>(store: Pick<StoreEvents, 'emit'>, mutate: F) => F;

  /** The dialogs store as its own files see it through `self`: everything, writable. */
  type DialogsStoreSelf = StoreEvents & {
    list: LinkedDialogsHandle;
    /** The archive folder's dialogs; empty until they finish loading. */
    archive: LinkedDialogsHandle;
    /** The main list, archive aside: what "All chats" shows and the chat search reads. */
    all(): Dialog[];
    /** What a folder shows; "All chats" is `all()`, any other folder also reaches the archive. */
    inFolder(folder: Folder): Dialog[];
    /** A dialog in either the main list or the archive. */
    find(chatId: number): Dialog | null;
    isArchived(chatId: number): boolean;
    isMuted(chatId: number): boolean;
    markRead(chatId: number): void;
    receive(message: Message): Dialog;
    /** Swap the dialog's last message for its edited copy; an edit of any other message is a no-op. */
    replaceLast(message: Message): void;
    setAll(dialogs: Dialog[]): void;
    setArchived(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  /**
   * The dialogs store as the rest of the app sees it: the dialogs it hands out are read-only, so
   * the only way to change one is a mutator, and every mutator emits `change`.
   */
  type DialogsStore = Omit<
    DialogsStoreSelf,
    'list' | 'archive' | 'emitter' | 'emit' | 'all' | 'inFolder' | 'find' | 'receive'
  > & {
    all(): Readonly<Dialog>[];
    inFolder(folder: Folder): Readonly<Dialog>[];
    find(chatId: number): Readonly<Dialog> | null;
    receive(message: Message): Readonly<Dialog>;
  };

  /** The folders store as its own files see it through `self`: everything, writable. */
  type FoldersStoreSelf = StoreEvents & {
    /** In the user's order, "All chats" among them; just that one until the folders load. */
    list: Folder[];
    selectedId: number;
    setAll(folders: Folder[]): void;
    readonly selected: Folder;
    select(folderId: number): void;
    /** Select the folder `step` away from the current one, wrapping around. */
    step(step: number): void;
    /** Whether the account has folders of its own beyond "All chats". */
    readonly hasCustom: boolean;
  };

  /** The folders store as the rest of the app sees it: read-only but for its mutators. */
  type FoldersStore = Omit<FoldersStoreSelf, 'list' | 'selectedId' | 'emitter' | 'emit'> & {
    readonly list: readonly Folder[];
  };

  /** The chat store as its own files see it through `self`: everything, writable. */
  type ChatStoreSelf = StoreEvents & {
    /** The open chat, and the app's single source of truth for which chat that is. */
    chatId: number | null;
    /** The loaded window, oldest first. */
    messages: ChatMessage[];
    readUpTo: number;
    /** The open chat's history pager; the store holds it but never advances it. */
    pager: AsyncGenerator<Message[]> | null;
    /** The open chat partner's online/last-seen state; `null` until fetched, or for non-users. */
    presence: Presence | null;
    append(message: ChatMessage): void;
    /** Swap a pending message for the server's copy, or drop it when that copy is already held. */
    confirm(tempId: number, message: Message): void;
    /** Take a message back out of the window — the store half of undoing a failed send. */
    drop(tempId: number): void;
    /** Whether the window holds the server's copy of a message — pending entries never match. */
    hasConfirmed(messageId: number): boolean;
    open(chatId: number, pager: AsyncGenerator<Message[]>): void;
    prepend(older: ChatMessage[]): void;
    /** Swap a held message for the server's copy of the same id; throws when it isn't held. */
    replace(message: Message): void;
    /** Lay the first page under the window, dropping held entries the page already has. */
    seed(page: Message[]): void;
    setPresence(presence: Presence | null): void;
    /** Derived, recomputed on every read: `null` when the last message isn't ours. */
    readonly receipt: Receipt | null;
    setReadUpTo(maxReadId: number): void;
  };

  /**
   * The chat store as the rest of the app sees it: read-only but for its mutators, so a held
   * message can only be swapped through one (see src/05-store/chat/2-chat.js), and every mutator
   * emits `change`.
   */
  type ChatStore = Omit<
    ChatStoreSelf,
    'chatId' | 'messages' | 'readUpTo' | 'pager' | 'presence' | 'emitter' | 'emit'
  > & {
    readonly chatId: number | null;
    readonly messages: readonly Readonly<ChatMessage>[];
    readonly readUpTo: number;
    readonly pager: AsyncGenerator<Message[]> | null;
    readonly presence: Presence | null;
  };

  /** Terminal window focus, as reported by the terminal — see src/5-store/window.js. */
  type WindowStore = { focused: boolean };

  /** The release the last check found, or null once dismissed/upgraded; see
   * src/(common)/Update and src/05-store/update.js. */
  type UpdateStore = { available: UpdateRelease | null };

  namespace store {
    const dialogs: DialogsStore;
    const folders: FoldersStore;
    const chat: ChatStore;
    const window: WindowStore;
    const update: UpdateStore;
  }
}

export {};
