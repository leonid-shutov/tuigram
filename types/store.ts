import { Message, Dialog, LinkedDialogsHandle } from './domain';
import { LinkedList } from './collections';

declare global {
  type DialogsEventMap = {
    /** The list's content changed in a way the UI must repaint. */
    changed: [];
    /** A message arrived from the dispatcher and survived the archive filter. */
    message: [message: Message];
  };

  /**
   * The dialog list, as data. Nothing here knows a renderable exists — that invariant is what
   * lets the dialogs pane and the picker read the same list without reading each other.
   */
  type DialogsStore = {
    all(): Dialog[];
    /** Fold a message into the list, whichever direction it came from. */
    applyMessage(message: Message): void;
    find(chatId: number): Dialog | null;
    isArchived(chatId: number): boolean;
    isMuted(chatId: number): boolean;
    /** Fill the list from the messenger: fast first page, then the full list, then the archive. */
    load(): Promise<void>;
    markRead(chatId: number): void;
    on<K extends keyof DialogsEventMap>(event: K, handler: (...args: DialogsEventMap[K]) => void): void;
    /** A message from the dispatcher: archive filter, then `applyMessage`, then `message`.
     * Returns false when the chat is archived and the message was dropped. */
    receive(message: Message): boolean;
    set(dialogs: Dialog[]): void;
    setArchived(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  /**
   * State is `self`-private by convention. `self` is `Object.create(container)`, so
   * `self.dialogs = …` shadows rather than updates the module property — which is exactly why
   * nothing outside the store may read `store.dialogs.dialogs`; go through `all()`/`find()`.
   */
  type DialogsStoreSelf = DialogsStore & {
    dialogs: LinkedDialogsHandle;
    /** Chat ids in the archive folder. Empty until the archived page finishes loading. */
    archived: Set<number>;
    /**
     * Deliberately untyped: `EventEmitter<Map>`'s conditional arg type does not survive a
     * generic `K`, so the map is enforced on the `emit`/`on` facade instead of the emitter.
     */
    dialogEvents: import('node:events').EventEmitter;
    emit<K extends keyof DialogsEventMap>(event: K, ...args: DialogsEventMap[K]): void;
  };

  type ChatEventMap = {
    /** A different chat was loaded; `messages` is the whole first window, oldest first. */
    opened: [{ chatId: number; messages: Message[] }];
    appended: [message: Message];
    /** An older page, newest-first — the order the section must insert it in. */
    prepended: [messages: Message[]];
    /** The server's message replaced a pending one, under a different id. */
    confirmed: [{ tempId: number; message: Message }];
    /** The read watermark moved. */
    receipt: [];
  };

  /**
   * The open conversation, as data: which chat, its loaded window, its history pager and the
   * read watermark. Navigation is by message id — the chat section must never hold a
   * `LinkedListNode` into this list.
   */
  type ChatStore = {
    all(): Message[];
    append(message: Message): void;
    confirm(tempId: number, message: Message): void;
    isNearOldest(id: number | null, within: number): boolean;
    isNewest(id: number | null): boolean;
    isOldest(id: number | null): boolean;
    /** Page in the next older window; emits `prepended`. No-op while one is already in flight. */
    loadOlder(): Promise<void>;
    newest(): Message | null;
    next(id: number | null): number | null;
    on<K extends keyof ChatEventMap>(event: K, handler: (...args: ChatEventMap[K]) => void): void;
    /** No-op when `chatId` is already open. Marks the dialog read and sends the receipt. */
    open(chatId: number): Promise<void>;
    /** Which chat is open, or undefined before the first one. */
    opened(): number | undefined;
    prev(id: number | null): number | null;
    /** Highest outgoing message id the peer has read. */
    readUpTo(): number;
    /** Pending message → sendMessage → confirm → fold into the dialog list. */
    send(text: string): Promise<void>;
    setReadUpTo(maxReadId: number): void;
  };

  /** Same shadowing caveat as DialogsStoreSelf: read through the functions, not the module. */
  type ChatStoreSelf = ChatStore & {
    /** undefined until the first chat is opened. */
    chatId?: number;
    messages: LinkedList<Message>;
    readMaxId: number;
    /** The open chat's history pager; undefined until a chat is opened. */
    iterator?: AsyncGenerator<Message[]>;
    loadingMore: boolean;
    chatEvents: import('node:events').EventEmitter;
    clear(): void;
    emit<K extends keyof ChatEventMap>(event: K, ...args: ChatEventMap[K]): void;
  };

  namespace store {
    const dialogs: DialogsStore;
    const chat: ChatStore;
  }
}

export {};
