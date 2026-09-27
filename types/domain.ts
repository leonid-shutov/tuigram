/**
 * The parts of an image-bearing medium the chat needs to draw a thumbnail. Every field is
 * available straight off the fetched message — none of it costs a download.
 */
export type MediaImage = {
  /** Complete JPEG of the ~40px stripped thumbnail; mtcute inflates it for us. */
  preview: Uint8Array | null;
  /** File id of the 320px thumbnail, for `messenger.downloadThumb`. */
  thumbId: string | null;
  /** The 320px thumbnail itself, once `actions.loadThumb` has downloaded it. */
  thumb: Uint8Array | null;
  /** Dimensions of the full medium, used to size the bubble before any pixels arrive. */
  width: number;
  height: number;
};

/** A medium that can be downloaded and opened in an external viewer. */
export type MediaFile = {
  /** File id the client can download the full medium with. */
  fileId: string;
  /** Original file name provided by the sender, when available. */
  fileName: string | null;
  /** MIME type of the full medium. */
  mimeType: string;
};

/** The two variants that carry a drawable image, and so the only ones with `preview`/`thumbId`/`thumb`. */
export type ImageMedia =
  | ({ type: 'video'; duration: number; isAnimation: boolean; isRound: boolean } & MediaImage & MediaFile)
  | ({ type: 'photo' } & MediaImage & MediaFile);

export type Media =
  | ImageMedia
  | ({ type: 'voice'; duration: number } & MediaFile)
  | ({ type: 'audio'; duration: number; title: string | null; performer: string | null } & MediaFile)
  | ({ type: 'sticker'; emoji: string } & MediaFile)
  | ({ type: 'document' } & MediaFile)
  | { type: 'contact'; firstName: string; lastName: string | null }
  | { type: 'poll'; question: string }
  | { type: 'dice'; emoji: string; value: number }
  | { type: 'game' | 'invoice' | 'venue'; title: string }
  | { type: 'todo'; title: string }
  | { type: 'call'; isVideo: boolean; duration: number; reason: 'missed' | 'busy' | 'disconnect' | null }
  | { type: 'location' | 'live_location' | 'story' | 'paid' | 'webpage' | 'unknown' };

/** Every variant of `Media` that carries something downloadable — what `openMedia` can act on. */
export type FileMedia = Extract<Media, MediaFile>;

export type Message = {
  /** Telegram sends an album as one message per picture; tuigram folds it into one message. Its
   * id is the Telegram message carrying the text — the caption's part, or the first part when
   * there is no caption — so an edit targets it directly. */
  id: number;
  text: string;
  /** Everything attached: nothing, one medium, or every picture of an album in the order sent. */
  media: Media[];
  pending: boolean;
  sender: { id: number | null; isSelf: boolean; displayName: string | null };
  chatId: number;
  chatName: string;
  isGroup: boolean;
  /** Set when the message was forwarded; `id` is null for a sender with forwards hidden. */
  forwardedFrom: { id: number | null; displayName: string } | null;
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
  /** Whether this dialog's peer is a real, non-self user — the only kind with a presence. */
  isUser: boolean;
};

/** A person's online/last-seen state, straight off mtcute's `UserStatus`, minus the `bot` case. */
export type Presence = {
  status: 'online' | 'offline' | 'recently' | 'within_week' | 'within_month' | 'long_time_ago';
  lastOnline: Date | null;
};

export type DialogOption = { chatId: number; name: string; description: string };

export type LinkedDialogsHandle = {
  find(chatId: number): Dialog | null;
  findNode(chatId: number): import('./collections').LinkedListNode<Dialog> | null;
  bump(node: import('./collections').LinkedListNode<Dialog>): void;
  unshift(dialog: Dialog): void;
  [Symbol.iterator](): Iterator<Dialog>;
};
