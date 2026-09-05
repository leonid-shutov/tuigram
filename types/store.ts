import { Dialog, Message, PendingMessage, LinkedDialogsHandle } from './domain';

declare global {
  /** A message held in the open chat's window — ours before the server confirms it, or theirs. */
  type ChatMessage = Message | PendingMessage;

  /** Whether the chat advertises a receipt on our own last message, and which one. */
  type Receipt = 'read' | 'unread';

  type DialogsStore = {
    list: LinkedDialogsHandle;
    /** Chat ids in the archive folder; filled once the archived dialogs finish loading. */
    archived: Set<number>;
    all(): Dialog[];
    find(chatId: number): Dialog | null;
    isArchived(chatId: number): boolean;
    isMuted(chatId: number): boolean;
    markRead(chatId: number): void;
    receive(message: Message): Dialog;
    setAll(dialogs: Dialog[]): void;
    setArchived(dialogs: Dialog[]): void;
    setUnread(chatId: number, unreadCount: number): void;
  };

  type ChatStore = {
    /** The open chat, and the app's single source of truth for which chat that is. */
    chatId: number | null;
    /** The loaded window, oldest first. */
    messages: ChatMessage[];
    readUpTo: number;
    append(message: ChatMessage): void;
    confirm(tempId: number, message: Message): boolean;
    open(chatId: number): void;
    prepend(older: ChatMessage[]): void;
    receipt(): Receipt | null;
    setReadUpTo(maxReadId: number): boolean;
  };

  namespace store {
    const dialogs: DialogsStore;
    const chat: ChatStore;
  }
}

export {};
