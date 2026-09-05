/**
 * The parts of an image-bearing medium the chat needs to draw a thumbnail. Every field is
 * available straight off the fetched message — none of it costs a download.
 */
export type MediaImage = {
  /** Complete JPEG of the ~40px stripped thumbnail; mtcute inflates it for us. */
  preview: Uint8Array | null;
  /** File id of the 320px thumbnail, for `messenger.downloadThumb`. */
  thumbId: string | null;
  /** Dimensions of the full medium, used to size the bubble before any pixels arrive. */
  width: number;
  height: number;
};

export type Media =
  | ({ type: 'video'; duration: number; isAnimation: boolean; isRound: boolean } & MediaImage)
  | ({ type: 'photo' } & MediaImage)
  | { type: 'voice'; duration: number }
  | { type: 'audio'; duration: number; title: string | null; performer: string | null }
  | { type: 'sticker'; emoji: string }
  | { type: 'document'; fileName: string | null; mimeType: string }
  | { type: 'contact'; firstName: string; lastName: string | null }
  | { type: 'poll'; question: string }
  | { type: 'dice'; emoji: string; value: number }
  | { type: 'game' | 'invoice' | 'venue'; title: string }
  | { type: 'todo'; title: string }
  | { type: 'location' | 'live_location' | 'story' | 'paid' | 'webpage' | 'unknown' };

export type Message = {
  id: number;
  text: string;
  media: Media | null;
  pending: boolean;
  sender: { id: number | null; isSelf: boolean; displayName: string | null };
  chatId: number;
  chatName: string;
  isGroup: boolean;
};

export type PendingMessage = Omit<Message, 'chatId' | 'chatName'> & { chatId: undefined; chatName: undefined };

export type Dialog = {
  chatId: number;
  name: string;
  lastMessage: Message | null;
  isPinned: boolean;
  unreadCount: number;
  isUnread: boolean;
  isMuted: boolean | null;
};

export type DialogOption = { chatId: number; name: string; description: string };

export type LinkedDialogsHandle = {
  find(chatId: number): Dialog | null;
  findNode(chatId: number): import('./collections').LinkedListNode<Dialog> | null;
  bump(node: import('./collections').LinkedListNode<Dialog>): void;
  unshift(dialog: Dialog): void;
  [Symbol.iterator](): Iterator<Dialog>;
};
