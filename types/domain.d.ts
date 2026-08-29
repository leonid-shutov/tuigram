export type MediaDescriptor =
  | { type: 'video'; duration: number; isAnimation: boolean; isRound: boolean }
  | { type: 'voice'; duration: number }
  | { type: 'audio'; duration: number; title: string | null; performer: string | null }
  | { type: 'sticker'; emoji: string }
  | { type: 'document'; fileName: string | null; mimeType: string }
  | { type: 'contact'; firstName: string; lastName: string | null }
  | { type: 'poll'; question: string }
  | { type: 'dice'; emoji: string; value: number }
  | { type: 'game' | 'invoice' | 'venue'; title: string }
  | { type: 'todo'; title: string }
  | { type: 'photo' | 'location' | 'live_location' | 'story' | 'paid' | 'webpage' | 'unknown' };

export type AppMessage = {
  id: number | string;
  text: string;
  media: MediaDescriptor | null;
  pending: boolean;
  sender: { id: number | null; isSelf: boolean; displayName: string | null };
  chatId: number | null;
  chatName: string | null;
  isGroup: boolean;
};

export type Dialog = {
  chatId: number;
  name: string;
  lastMessage: AppMessage | null;
  isPinned: boolean;
  unreadCount: number;
  isUnread: boolean;
  isMuted: boolean | null;
};

export type UiDialog = Omit<Dialog, 'lastMessage'> & { lastMessage: string };

export type DialogOption = { chatId: number; name: string; description: string };

export type LinkedDialogsHandle = {
  find(chatId: number): UiDialog | null;
  findNode(chatId: number): import('./collections').LinkedListNode<UiDialog> | null;
  bump(node: import('./collections').LinkedListNode<UiDialog>): void;
  unshift(dialog: UiDialog): void;
  [Symbol.iterator](): Iterator<UiDialog>;
};
