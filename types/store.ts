import { Dialog, Folder, Message, PendingMessage, LinkedDialogsHandle, Presence } from './domain';

declare global {
  /** A message held in the open chat's window — ours before the server confirms it, or theirs. */
  type ChatMessage = Message | PendingMessage;

  /** Whether the chat advertises a receipt on our own last message, and which one. */
  type Receipt = 'read' | 'unread';

  type DialogsStore = {
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
    setAll(dialogs: Dialog[]): void;
    setArchived(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  type FoldersStore = {
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

  type ChatStore = {
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
