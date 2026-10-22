import { Dialog, Folder, Message, PendingMessage, LinkedDialogsHandle, Presence, TypingStatus } from './domain';

declare global {
  /** A message in a cached chat — ours before the server confirms it, or theirs. */
  type ChatMessage = Message | PendingMessage;

  /** Whether the chat advertises a receipt on our own last message, and which one. */
  type Receipt = 'read' | 'unread';

  /**
   * A store's change event: every mutator emits `change` once it returns, by way of `Mutation`,
   * so `on('change')` hears about every change made through the store. The mutator's arguments
   * ride along to `emit`, for a store that tells changes apart by them.
   */
  type StoreEvents = {
    emitter: import('node:events').EventEmitter;
    emit(event: 'change', ...args: unknown[]): void;
    on(event: 'change', handler: () => void): void;
  };

  /**
   * Wrap a store mutator so the store emits `change` once it returns: synchronously, so a
   * listener sees the new state before the caller's next line, and not at all if it throws.
   */
  const Mutation: <F extends (...args: any[]) => unknown>(store: Pick<StoreEvents, 'emit'>, mutate: F) => F;

  /**
   * A chat store mutator as written: handed the cached chat instead of its id. `ChatMutation`
   * turns it back into the mutator callers see, `(chatId, ...args)`.
   */
  type ChatMutator<F> = F extends (chatId: number, ...args: infer A) => infer R
    ? (chat: CachedChat, ...args: A) => Exclude<R, null>
    : never;

  /**
   * Wrap a chat store mutator (visible only under src/05-store/chat): look its chat up by id, do
   * nothing and answer null when it isn't cached, and emit `change` as `Mutation` does.
   */
  const ChatMutation: <A extends any[], R>(
    mutate: (chat: CachedChat, ...args: A) => R,
  ) => (chatId: number, ...args: A) => R | null;

  /**
   * A dialogs store mutator as written: handed the dialog instead of its chat's id. `DialogMutation`
   * turns it back into the mutator callers see, `(chatId, ...args)`.
   */
  type DialogMutator<F> = F extends (chatId: number, ...args: infer A) => void
    ? (dialog: Dialog, ...args: A) => void
    : never;

  /**
   * Wrap a dialogs store mutator (visible only under src/05-store/dialogs): look its dialog up by
   * chat id in the main list or the archive, do nothing when there is none, and emit `change` as
   * `Mutation` does.
   */
  const DialogMutation: <A extends any[]>(
    mutate: (dialog: Dialog, ...args: A) => void,
  ) => (chatId: number, ...args: A) => void;

  /** The dialogs store as its own files see it through `self`: everything, writable. */
  type DialogsStoreSelf = StoreEvents & {
    list: LinkedDialogsHandle;
    /** The archive folder's dialogs; empty until its pages land. */
    archive: LinkedDialogsHandle;
    /** The main list, archive aside: what "All chats" shows and the chat search reads. */
    all(): Dialog[];
    /** What a folder shows; "All chats" is `all()`, any other folder also reaches the archive. */
    inFolder(folder: Folder): Dialog[];
    /** A dialog in either the main list or the archive. */
    find(chatId: number): Dialog | null;
    isArchived(chatId: number): boolean;
    /** Ids of the chats, archive included, whose last message is one of `messageIds`. */
    withLast(messageIds: number[]): number[];
    /** Whether the chat's dialog previews the message `messageId` as its last. */
    previews(chatId: number, messageId: number): boolean;
    isMuted(chatId: number): boolean;
    markRead(chatId: number): void;
    /** Take a new message in: it becomes the dialog's last and moves the dialog up, a chat the list
     * hasn't reached gets a dialog made from it, and one no newer than the last changes nothing. */
    receive(message: Message): Dialog;
    /** Set the dialog's last message after a delete, without moving it or touching unread counts. */
    setLast(chatId: number, message: Message | null): void;
    /** Lay a page of the fetched list, newest first, at the end of the main list or the archive,
     * each dialog where its `isArchived` says. A chat the store already has stays as it is, but
     * for who it is: its name, kind and mute. */
    land(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
    /** Move the dialog's outbox read mark up to `maxReadId`; never back. */
    setReadUpTo(chatId: number, maxReadId: number): void;
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

  /** One chat as store.chat caches it: its messages, oldest first and whole at the newest end (see
   * src/05-store/chat/2-chat.js). Its outbox read mark is its dialog's; its partner's presence is
   * store.peers'. */
  type CachedChat = { messages: ChatMessage[] };

  /**
   * The chat store as its own files see it through `self`: everything, writable. It caches a
   * chat per recently opened or preloaded one; every mutator names its chat first, does nothing when that
   * chat isn't cached, and emits `change` only when it is the open one.
   */
  type ChatStoreSelf = Omit<StoreEvents, 'emit'> & {
    /** The open chat, and the app's single source of truth for which chat that is. */
    openChatId: number | null;
    /** The cached chats, in order of caching: the first is the next to evict. */
    chats: Map<number, CachedChat>;
    /** The open chat as cached; null before the first chat opens. */
    readonly opened: CachedChat | null;
    /** Emit `change` when `chatId` is the open chat. */
    emit(event: 'change', chatId: number | undefined): void;
    /** The cached chat behind `chatId`, or null when it isn't cached. */
    getById(chatId: number): CachedChat | null;
    /** Drop a cached chat's oldest messages beyond `config.history.firstPageSize`. */
    trim(chat: CachedChat): void;
    /** Drop the chats cached longest ago beyond `config.history.maxCachedChats`, never the open one. */
    evict(): void;
    append(chatId: number, message: ChatMessage): void;
    /** Swap a pending message for the server's copy, or drop it when that copy is already cached. */
    confirm(chatId: number, tempId: number, message: Message): void;
    /** Take a message back out of the chat — the store half of undoing a failed send. */
    drop(chatId: number, tempId: number): void;
    /** Whether `chatId` is the open chat; never for a pending message's, which has none. */
    isOpen(chatId: number | undefined): boolean;
    /** Whether the chat has the server's copy of a message — pending entries never match. */
    hasConfirmed(chatId: number, messageId: number): boolean;
    /** The server's copy of a cached message, or null when it isn't cached or is still pending. */
    findConfirmed(chatId: number, messageId: number): Message | null;
    /** Like `findConfirmed`, but by any of the message's `partIds`: the album an update names one
     * picture of. */
    findPart(chatId: number, partId: number): Message | null;
    /** The newest confirmed message the chat has, or `null` when it has none. */
    lastConfirmed(chatId: number): Message | null;
    /** The oldest confirmed message the chat has — what older history pages below, and what a
     * page lands under — or `null` when it has none. */
    oldestConfirmed(chatId: number): Message | null;
    /** Whether the chat is cached and nothing from the server has landed in it, so it needs its
     * first page: it was just cached, or holds only our pending sends. */
    needsFirstPage(chatId: number): boolean;
    /** The cached chats that have the server's copy of any of `messageIds`. */
    holding(messageIds: number[]): number[];
    /** Cache `chatId`, empty until something lands in it, and move it to the back of the eviction line. */
    cache(chatId: number): void;
    /** Make `chatId` the open chat, cached from now on. */
    open(chatId: number): void;
    /** Lay a page, oldest first, under the chat's oldest confirmed message: only what is older than
     * it lands. Answers what landed, or null when the chat isn't cached. */
    prepend(chatId: number, older: Message[]): Message[] | null;
    /** Swap a cached message for the server's copy; throws when it isn't cached. The copy replaces the
     * message cached under `id`, which is its own unless an album's caption moved to another part. */
    replace(chatId: number, message: Message, id?: number): void;
    /** Take deleted messages out of the chat; a reply to one then reads as a deleted original. */
    remove(chatId: number, ids: number[]): void;
  };

  /**
   * The chat store as the rest of the app sees it: read-only but for its mutators, so a cached
   * message can only be swapped through one (see src/05-store/chat/2-chat.js), and every mutator
   * emits `change` for the open chat.
   */
  type ChatStore = Omit<
    ChatStoreSelf,
    'openChatId' | 'chats' | 'opened' | 'emitter' | 'emit' | 'getById' | 'trim' | 'evict'
  > & {
    readonly openChatId: number | null;
    readonly opened: { readonly messages: readonly Readonly<ChatMessage>[] } | null;
  };

  /**
   * The peers store as its own files see it through `self`: what other people are doing right now,
   * as the stream reports it, for every user it reports on. A status that says how long it holds
   * lapses on its own: the store keeps a timer per user and emits `change` when one runs out.
   */
  type PeersStoreSelf = StoreEvents & {
    /** The last presence heard of, by user id. */
    presence: Map<number, Presence>;
    /** The timer that ends a user's `online` at its `until`, by user id. */
    timers: Map<number, ReturnType<typeof setTimeout>>;
    /** Who is typing in each chat, by chat id and then user id, with the timer that ends it. */
    typing: Map<number, Map<number, { status: TypingStatus; timer: ReturnType<typeof setTimeout> }>>;
    /** The user's presence, or null when none was heard of; in a private chat the user id is the chat's. */
    presenceOf(userId: number): Presence | null;
    /** Who is typing in the chat right now, in the order they started. */
    typingIn(chatId: number): { userId: number; status: TypingStatus }[];
    /** Take a user's latest typing status in a chat; null ends it. Each runs out on its own, unless
     * renewed, after the 6 seconds Telegram holds it for. */
    setTyping(chatId: number, userId: number, status: TypingStatus | null): void;
    /** Take the user's latest presence; null forgets it. */
    setPresence(userId: number, presence: Presence | null): void;
    /** The user's `online` ran out with no word since: they went offline at its `until`. */
    lapse(userId: number): void;
  };

  /** The peers store as the rest of the app sees it: read-only but for its mutators. */
  type PeersStore = Omit<PeersStoreSelf, 'presence' | 'timers' | 'typing' | 'lapse' | 'emitter' | 'emit'>;

  /** Terminal window focus, as reported by the terminal — see src/5-store/window.js. */
  type WindowStore = { focused: boolean };

  /** The release the last check found, or null once dismissed/upgraded; see
   * src/(common)/Update and src/05-store/update.js. */
  type UpdateStore = { available: UpdateRelease | null };

  namespace store {
    const dialogs: DialogsStore;
    const folders: FoldersStore;
    const chat: ChatStore;
    const peers: PeersStore;
    const window: WindowStore;
    const update: UpdateStore;
  }
}

export {};
